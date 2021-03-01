import React from "react"

import Util from "./utils"

/* globals self CriticalRequestChainRenderer SnippetRenderer Util URL */

/** @typedef {import('./dom.js')} DOM */

const URL_PREFIXES = ['http://', 'https://', 'data:'];

class DetailsRenderer {

  static convertMarkdownCodeSnippets(markdownText) {
    const arr=[];
    for (const segment of Util.splitMarkdownCodeSpans(markdownText)) {
      if (segment.isCode) {
        arr.push(
            <code>{segment.text}</code>
        )
      } else {
        arr.push(segment.text)
      }
    }

    return arr;
  } 
static convertMarkdownLinkSnippets(text) {
    if(!text) return null;
    const arr=[]
    for (const segment of Util.splitMarkdownLink(text)) {
      if (!segment.isLink) {
        // Plain text segment.
        arr.push(
            segment.text
        )
        continue;
      }

      // Otherwise, append any links found.
      const url = new URL(segment.linkHref);

      const DOCS_ORIGINS = ['https://developers.google.com', 'https://web.dev'];
      if (DOCS_ORIGINS.includes(url.origin)) {
        url.searchParams.set('utm_source', 'lighthouse');
        url.searchParams.set('utm_medium', 'unknown');
      }
      arr.push(
          <a rel='noopener' target="_blank" href={url.href}>{segment.text}</a>
      )
    }

    return arr ;
  }
  static _renderBytes(details) {
    // TODO: handle displayUnit once we have something other than 'kb'
    // Note that 'kb' is historical and actually represents KiB.
    const value = Util.i18n.formatBytesToKiB(
      details.value,
      details.granularity
    );
    return (
      <div className="lh-text" title={Util.i18n.formatBytes(details.value)}>{value}</div>
    )
  }

  /**
   * @param {{value: number, granularity?: number, displayUnit?: string}} details
   * @return {Element}
   */
  static _renderMilliseconds(details) {
      let value = Util.i18n.formatMilliseconds(
      details.value,
      details.granularity
    );
    if (details.displayUnit === 'duration') {
      value = Util.i18n.formatDuration(details.value);
    }

    return DetailsRenderer._renderText(value);
  }

  /**
   * @param {string} text
   * @return {HTMLElement}
   */
  static displayedHostFunc(displayedHost){
    if (displayedHost){
      return(<div className="lh-text lh-text__url-host">{displayedHost}</div>)
    }
    return(<div></div>)
  }
  static renderTextURL(text,line=null,column=null,Class='') {
    const url = text;
    const className='lh-text__url '+Class; 
    let displayedPath;
    let displayedHost;
    let title;
    try {
      const parsed = Util.parseURL(url);
      displayedPath = parsed.file === '/' ? parsed.origin : parsed.file;
      displayedHost = parsed.file === '/' ? '' : `(${parsed.hostname})`;
      title = url;
    } catch (e) {
      displayedPath = url;
    }
    return(
      <div className={className} title={url} data-url={url}> 
        {DetailsRenderer._renderLink({ text: displayedPath, url },line,column)}
        {DetailsRenderer.displayedHostFunc(displayedHost)}
      </div>
    )
  }

  /**
   * @param {{text: string, url: string}} details
   * @return {Element}
   */
  static _renderLink(details,line=null,column=null) {
    const allowedProtocols = ['https:', 'http:'];
    let url;
    try {
      url = new URL(details.url);
    } catch (_) {}

    if (!url || !allowedProtocols.includes(url.protocol)) {
      // Fall back to just the link text if invalid or protocol not allowed.
      return DetailsRenderer._renderText(details.text);
    }
    if(line && column){
      const t=details.text+`:${line}:${column}`
      return (
        <a rel="noopener" target="_blank" href={url.href}>{t}</a>
      )
    }
    return (
      <a rel="noopener" target="_blank" href={url.href}>{details.text}</a>
    )
  }

  /**
   * @param {string} text
   * @return {HTMLDivElement}
   */
  static _renderText(text,Class='') {
    const className='lh-text '+Class; 
    return(
      <div className={className}>{text}</div>
    )
  }

  /**
   * @param {{value: number, granularity?: number}} details
   * @return {Element}
   */
  static _renderNumeric(details) {
    const value = Util.i18n.formatNumber(details.value, details.granularity);
    return (
      <div className="lh-numeric">
        {value}
      </div>
    )
  }

  /**
   * Create small thumbnail with scaled down image asset.
   * @param {string} details
   * @return {Element}
   */
  static _renderThumbnail(details) {
    return (
      <img className="lh-thumbnail" src={details} title={details} alt=""></img>
    )
  }

  /**
   * @param {string} type
   * @param {*} value
   */
  static _renderUnknown(type, value) {
    const Summary=`We don't know how to render audit details of type \`${type}\`. ` +
      'The Lighthouse version that collected this data is likely newer than the Lighthouse ' +
      'version of the report renderer. Expand for the raw JSON.';
    return(
      <details className='lh-unknown'>
        <summary>{Summary}</summary>
        <pre>{JSON.stringify(value,null,2)}</pre>
      </details>
    )
  }

  static _renderTableValue(value, heading) {
    if (value === undefined || value === null) {
      return null;
    }

    // First deal with the possible object forms of value.
    if (typeof value === 'object') {
      // The value's type overrides the heading's for this column.
      switch (value.type) {
        case 'code': {
          return DetailsRenderer._renderCode(value.value);
        }
        case 'link': {
          return DetailsRenderer._renderLink(value);
        }
        case 'node': {
          return DetailsRenderer.renderNode(value);
        }
        case 'source-location': {
          return DetailsRenderer.renderSourceLocation(value);
        }
        case 'url': {
          return DetailsRenderer.renderTextURL(value.value);
        }
      }
    }

    // Next, deal withDetailsRenderer. primitives
    switch (heading.valueType) {
      case 'bytes': {
        const numValue = Number(value);
        return DetailsRenderer._renderBytes({
          value: numValue,
          granularity: heading.granularity,
        });
      }
      case 'code': {
        const strValue = String(value);
        return DetailsRenderer._renderCode(strValue);
      }
      case 'ms': {
        const msValue = {
          value: Number(value),
          granularity: heading.granularity,
          displayUnit: heading.displayUnit,
        };
        return DetailsRenderer._renderMilliseconds(msValue);
      }
      case 'numeric': {
        const numValue = Number(value);
        return DetailsRenderer._renderNumeric({
          value: numValue,
          granularity: heading.granularity,
        });
      }
      case 'text': {
        const strValue = String(value);
        return DetailsRenderer._renderText(strValue);
      }
      case 'thumbnail': {
        const strValue = String(value);
        return DetailsRenderer._renderThumbnail(strValue);
      }
      case 'timespanMs': {
        const numValue = Number(value);
        return DetailsRenderer._renderMilliseconds({ value: numValue });
      }
      case 'url': {
        const strValue = String(value);
        if (URL_PREFIXES.some((prefix) => strValue.startsWith(prefix))) {
          return DetailsRenderer.renderTextURL(strValue);
        } else {
          // Fall back to <pre> rendering if not actually a URL.
          return DetailsRenderer._renderCode(strValue);
        }
      }
      default: {
        return DetailsRenderer._renderUnknown(heading.valueType, value);
      }
    }
  }

  /**
   * Get the headings of a table-like details object, converted into the
   * OpportunityColumnHeading type until we have all details use the same
   * heading format.
   * @param {LH.Audit.Details.Table|LH.Audit.Details.Opportunity} tableLike
   * @return {Array<LH.Audit.Details.OpportunityColumnHeading>}
   */
  static _getCanonicalizedHeadingsFromTable(tableLike) {
    if (tableLike.type === 'opportunity') {
      return tableLike.headings;
    }

    return tableLike.headings.map((heading) =>
      DetailsRenderer._getCanonicalizedHeading(heading)
    );
  }

  /**
   * Get the headings of a table-like details object, converted into the
   * OpportunityColumnHeading type until we have all details use the same
   * heading format.
   * @param {LH.Audit.Details.TableColumnHeading} heading
   * @return {LH.Audit.Details.OpportunityColumnHeading}
   */
  static _getCanonicalizedHeading(heading) {
    let subItemsHeading;
    if (heading.subItemsHeading) {
      subItemsHeading = DetailsRenderer._getCanonicalizedsubItemsHeading(
        heading.subItemsHeading,
        heading
      );
    }

    return {
      key: heading.key,
      valueType: heading.itemType,
      subItemsHeading,
      label: heading.text,
      displayUnit: heading.displayUnit,
      granularity: heading.granularity,
    };
  }

  /**
   * @param {Exclude<LH.Audit.Details.TableColumnHeading['subItemsHeading'], undefined>} subItemsHeading
   * @param {LH.Audit.Details.TableColumnHeading} parentHeading
   * @return {LH.Audit.Details.OpportunityColumnHeading['subItemsHeading']}
   */
  static _getCanonicalizedsubItemsHeading(subItemsHeading, parentHeading) {
    // Low-friction way to prevent commiting a falsy key (which is never allowed for
    // a subItemsHeading) from passing in CI.
    if (!subItemsHeading.key) {
      // eslint-disable-next-line no-console
      console.warn('key should not be null');
    }

    return {
      key: subItemsHeading.key || '',
      valueType: subItemsHeading.itemType || parentHeading.itemType,
      granularity: subItemsHeading.granularity || parentHeading.granularity,
      displayUnit: subItemsHeading.displayUnit || parentHeading.displayUnit,
    };
  }

  /**
   * Returns a new heading where the values are defined first by `heading.subItemsHeading`,
   * and secondly by `heading`. If there is no subItemsHeading, returns null, which will
   * be rendered as an empty column.
   * @param {LH.Audit.Details.OpportunityColumnHeading} heading
   * @return {LH.Audit.Details.OpportunityColumnHeading | null}
   */
  static _getDerivedsubItemsHeading(heading) {
    if (!heading.subItemsHeading) return null;
    return {
      key: heading.subItemsHeading.key || '',
      valueType: heading.subItemsHeading.valueType || heading.valueType,
      granularity: heading.subItemsHeading.granularity || heading.granularity,
      displayUnit: heading.subItemsHeading.displayUnit || heading.displayUnit,
      label: '',
    };
  }
  static renderTableHeader(details){
    if(!details) return null;
    
    if(details.type!== "table" && details.type !== "opportunity"){
      console.log(details.type)
      return null}
    const headings = DetailsRenderer._getCanonicalizedHeadingsFromTable(details);
    return headings.map((heading)=>(
        <th class={Util.getValueType(heading)}><div class="lh-text">{heading.label}</div></th>
    ))
  
  }
  static rowrender=(item,details)=>{
  
      const headings=DetailsRenderer._getCanonicalizedHeadingsFromTable(details);
      
      return (
          headings.map((heading)=>{
              if (!heading || !heading.key) {
                  return <td className="lh-table-column--empty"></td>
              }
              else{
                  const value = item[heading.key];
                  let valueElement;
                  if (value !== undefined && value !== null) {
                  valueElement = DetailsRenderer._renderTableValue(value, heading)
                  }
                  if (valueElement) {
                      const classes = `lh-table-column--${heading.valueType}`;
                      return (<td className={classes}>
                          {valueElement}
                      </td>)
                    } else {
  
                      return(<td className="lh-table-column--empty"></td>)
                    }
              }
          })
      )
  }
  static tablerender=(details)=>{
    if(!details) return null;
      if(details.type!=='table' && details.type !="opportunity") return null
      if(!details.items){
          return (null);
      }
      if (details.items.length===0){
          return (null);
      }
      return (details.items.map((item)=>(
          <tr>{DetailsRenderer.rowrender(item,details)}</tr>
      )))
  }

  /**
   * @param {LH.Audit.Details.List} details
   * @return {Element}
   */
  /*
   _renderList(details) {
    const listContainer = this._dom.createElement('div', 'lh-list');

    details.items.forEach((item) => {
      const snippetEl = SnippetRenderer.render(
        this._dom,
        this._templateContext,
        item,
        this
      );
      listContainer.appendChild(snippetEl);
    });

    return listContainer;
  }

  /**
   * @param {LH.Audit.Details.NodeValue} item
   * @return {Element}
   */
  static nodeFunction(nodeLabel){
    if(!nodeLabel) {
      return(
        <div></div>
      )
    }
    return(<div>{nodeLabel}</div>)
  }
  static renderSnippet(snippet){
    if(!snippet){
      <div></div>
    }
    return(
      <div className='lh-node__snippet'>{snippet}</div>
    )
  }
  static renderNode(item) {
    return (
      <span className='lh-node' title={item.selector} data-path={item.path} data-selector={item.selector} data-snippet={item.snippet}>
        {DetailsRenderer.nodeFunction(item.nodeLabel)}
        {DetailsRenderer.renderSnippet(item.snippet)}

      </span>
    )
    /*
    const element = this._dom.createElement('span', 'lh-node');
    if (item.nodeLabel) {
      const nodeLabelEl = this._dom.createElement('div');
      nodeLabelEl.textContent = item.nodeLabel;
      element.appendChild(nodeLabelEl);
    }

    if (item.snippet) {
      const snippetEl = this._dom.createElement('div');
      snippetEl.classList.add('lh-node__snippet');
      snippetEl.textContent = item.snippet;
      element.appendChild(snippetEl);
    }
    if (item.selector) {
      element.title = item.selector;
    }
    if (item.path) element.setAttribute('data-path', item.path);
    if (item.selector) element.setAttribute('data-selector', item.selector);
    if (item.snippet) element.setAttribute('data-snippet', item.snippet);

    return element;
    */
  }

  /**
   * @param {LH.Audit.Details.SourceLocationValue} item
   * @return {Element|null}
   * @protected
   * 
   */
  
  static renderSourceLocation(item) {
    if (!item.url) {
      return(<div></div>)
    }

    // Lines are shown as one-indexed.
    const line = item.line + 1;
    const column = item.column;
    if (item.urlProvider === 'network') {
      return DetailsRenderer.renderTextURL(item.url,line,column,'lh-source-location')
    } else {
      return DetailsRenderer._renderText(
        `${item.url}:${line}:${column} (from sourceURL)`,'lh-source-location'
      );
    }
    /*
    element.classList.add('lh-source-location');
    element.setAttribute('data-source-url', item.url);
    // DevTools expects zero-indexed lines.
    element.setAttribute('data-source-line', String(item.line));
    element.setAttribute('data-source-column', String(item.column));
    return element;
    */
  }

  /**
   * @param {LH.Audit.Details.Filmstrip} details
   * @return {Element}
   */
  /*
  _renderFilmstrip(details) {
    const filmstripEl = this._dom.createElement('div', 'lh-filmstrip');

    for (const thumbnail of details.items) {
      const frameEl = this._dom.createChildOf(
        filmstripEl,
        'div',
        'lh-filmstrip__frame'
      );
      this._dom.createChildOf(frameEl, 'img', 'lh-filmstrip__thumbnail', {
        src: thumbnail.data,
        alt: `Screenshot`,
      });
    }
    return filmstripEl;
  }
  */
  /**
   * @param {string} text
   * @return {Element}
   */
  static _renderCode(text) {
    return(<pre className="lh-code">{text}</pre>)
  }
}

export default DetailsRenderer;
