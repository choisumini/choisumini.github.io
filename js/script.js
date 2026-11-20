/* BEHIND THE LABEL: 한 화면에 고정된 스크롤 스토리 */
(() => {
  const story = document.querySelector('.scroll-story');
  const screen = story?.querySelector('.sticky-screen');
  if (!story || !screen) return;
  const panels = [...screen.querySelectorAll('.story-panel')];
  if (panels.length !== 4) return;
  const sweater = panels[0].querySelector('.sweater--intro');
  const title = panels[0].querySelector('.main-title');
  const bubbles = [panels[1], panels[2]].map(panel => panel.querySelector('.speech-bubble'));
  const labelPanel = panels[3].querySelector('.label-panel');
  const caption = panels[3].querySelector('.label-caption');
  if (![sweater,title,...bubbles,labelPanel,caption].every(Boolean)) return;

  const clamp = x => Math.max(0, Math.min(1, x));
  const smooth = x => { x = clamp(x); return x*x*(3-2*x); };
  const ramp = (p,a,b) => smooth((p-a)/(b-a));
  let clicked = false;

  // 말풍선은 전체 이동 중 opacity=1. 배경색 알파만 CSS에서 .8로 유지.
  // 요소의 bottom 기준 위치에서 시작해 화면 아래->중앙->화면 위로 이동.
  function travel(el,p,start,mid,end) {
    const screenHeight = screen.clientHeight;
    const elementHeight = el.getBoundingClientRect().height;
    const bottomPx = parseFloat(getComputedStyle(el).bottom) || 0;
    const below = screenHeight + elementHeight + bottomPx + 20;
    const above = -(screenHeight + elementHeight + bottomPx + 20);
    let offset;
    if (p < mid) offset = below + (-36 - below)*ramp(p,start,mid);
    else offset = -36 + (above + 36)*ramp(p,mid,end);
    const visible = p >= start && p <= end;
    el.style.transform = `translate(-50%, ${offset}px)`;
    el.style.opacity = '1';
    el.style.visibility = visible ? 'visible' : 'hidden';
  }

  function progress() {
    // 기존 600vh 기준의 스크롤 좌표를 유지하여 1~3번 속도와 타이밍은 바꾸지 않는다.
    return Math.max(0, Math.min(1.12, -story.getBoundingClientRect().top / Math.max(1, 5 * innerHeight)));
  }
  function update() {
    const p = progress();
    title.style.opacity = String(1-ramp(p,.02,.20));
    travel(bubbles[0],p,.20,.29,.43);
    travel(bubbles[1],p,.43,.53,.69);

    // 세 번째 구간에서 클릭한 후에만 스웨터 확대와 라벨 전환 시작.
    const zoom = clicked ? ramp(p,.70,.84) : 0;
    const reveal = clicked ? ramp(p,.78,.88) : 0;
    const baseWidth = sweater.getBoundingClientRect().width / (1+(1920/829-1)*zoom);
    const maxScale = Math.max(1,screen.clientWidth / Math.max(1,baseWidth));
    sweater.style.transform = `translateX(-50%) scale(${1+(maxScale-1)*zoom})`;
    sweater.style.opacity = String(1-reveal);
    const clickable = p >= .43 && p <= .70 && !clicked;
    sweater.style.pointerEvents = clickable ? 'auto' : 'none';
    sweater.style.cursor = clickable ? 'pointer' : 'default';
    sweater.tabIndex = clickable ? 0 : -1;
    labelPanel.style.setProperty('--reveal',String(reveal));
    if (clicked && p >= .88) travel(caption,p,.88,.99,1.12);
    else { caption.style.opacity='1'; caption.style.visibility='hidden'; caption.style.transform='translate(-50%, 120vh)'; }
  }
  function activate() {
    const p=progress();
    if (p < .43 || p > .70 || clicked) return;
    clicked=true;
    update();
  }
  sweater.setAttribute('role','button');
  sweater.setAttribute('aria-label','스웨터를 클릭하고 아래로 스크롤하여 라벨 보기');
  sweater.addEventListener('click',activate);
  sweater.addEventListener('keydown',e => {
    if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}
  });
  let pending=false;
  const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;update();});};
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule);
  update();
})();
