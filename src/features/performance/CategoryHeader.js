import React from "react"
import Util from "./utils"
function convertMarkdownLinkSnippets(text) {
    const arr=[]
    for (const segment of Util.splitMarkdownLink(text)) {
      if (!segment.isLink) {
        // Plain text segment.
        arr.push(segment.text)
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
function getDescription(description) {
    if(!description){
        return null;
    }
    return convertMarkdownLinkSnippets(description)
}  
export const CategoryHeader = (props)=>{
    const score=parseInt(parseFloat(props.category.score)*100);
    const degree=score*355/100;
    const a=degree+" , 351.858";
    const todo={
                    transform:"rotate(-87.9537deg)",
                    strokeDasharray: a,    
                }
    let class1=null;
    if(score<50){
        class1="lh-gauge__wrapper lh-gauge__wrapper--fail";
    }
    else if (score>49 && score <90){
        class1="lh-gauge__wrapper lh-gauge__wrapper--average";
    }
    else{
        class1="lh-gauge__wrapper lh-gauge__wrapper--pass"
    }
    return(
        <div class="lh-category-header">
        <div class="lh-score__gauge" role="heading" aria-level="2">
        <a href="#" class={class1}>
        <div class="lh-gauge__svg-wrapper">
        <svg viewBox="0 0 120 120" class="lh-gauge">
        <circle class="lh-gauge-base" r="56" cx="60" cy="60" stroke-width="8"></circle>
        <circle class="lh-gauge-arc" r="56" cx="60" cy="60" stroke-width="8" style={todo}></circle>
        </svg>
        </div>
        <div class="lh-gauge__percentage">{score}</div>
        <div class="lh-gauge__label">{props.category.title}</div>
        </a>
        </div>
        <div class="lh-category-header__description">{getDescription(props.category.description)}</div>
        </div>
    );
}