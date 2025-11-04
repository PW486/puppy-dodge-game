import { Game } from './src/game.js';

const canvas = document.getElementById('game');
const game = new Game(canvas);

// 터치 컨트롤
const touchControls = document.getElementById('touchControls');
const btnLeft = document.getElementById('btnLeft');
const btnRight = document.getElementById('btnRight');

// 모바일 터치/버튼 입력 처리 (지속 이동 지원)
btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); game.keys.left = true; });
btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); game.keys.left = false; });
btnLeft.addEventListener('mousedown', () => game.keys.left = true);
btnLeft.addEventListener('mouseup', () => game.keys.left = false);

btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); game.keys.right = true; });
btnRight.addEventListener('touchend', (e) => { e.preventDefault(); game.keys.right = false; });
btnRight.addEventListener('mousedown', () => game.keys.right = true);
btnRight.addEventListener('mouseup', () => game.keys.right = false);

// 기존 터치(화면 어디든지 누름)도 지원: 좌/우 반으로 나눠 처리
canvas.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = t.clientX - rect.left;
  game.keys.left = x < canvas.width/2;
  game.keys.right = x >= canvas.width/2;
});
canvas.addEventListener('touchend', () => { game.keys.left = false; game.keys.right = false; });

// 모바일 기기 감지해서 터치 컨트롤 표시/숨김
if (window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches) {
  touchControls.classList.remove('hidden');
} else {
  touchControls.classList.add('hidden');
}

// 게임 시작
game.start();