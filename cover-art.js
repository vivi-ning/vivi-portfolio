const SHOWCASE_COVERS={
 14:{src:'assets/moviy-oy/brand-cover-v2.webp',focus:'52% center',kind:'concept'},
 1:{src:'assets/zicony-home-v2.jpg',focus:'76% 65%',kind:'original'},
 4:{src:'assets/retouched/volunteer-clean-v2.webp',focus:'60% center',kind:'original'},
 2:{src:'assets/white-crane-showcase.jpg',focus:'80% center',kind:'original'},
 0:{src:'assets/generated-covers/magicfix-wide-v2.webp',focus:'50% center',kind:'concept'}
};
function showcaseArt(project){const src=SHOWCASE_COVERS[project.id]?.src||project.cover;return window.IMAGE_PREVIEWS?.[src]?.wide||src}
function showcaseArtFocus(project){return SHOWCASE_COVERS[project.id]?.focus||'center'}
