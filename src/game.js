import { Player } from './entities';
import { ParticleSystem } from './particles';
import { SoundManager } from './sound';
import { collision, formatScore, storage } from './utils';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    
    this.particles = new ParticleSystem();
    this.sound = new SoundManager();
    
    // 게임 상태
    this.reset();
    
    // 입력 상태
    this.keys = { left: false, right: false };
    
    // 이벤트 바인딩
    this.bindEvents();
  }
  
  reset() {
    this.player = new Player(this.width/2 - 20, this.height - 70);
    this.obstacles = [];
    this.lastSpawn = 0;
    this.spawnInterval = 800;
    this.score = 0;
    this.level = 1;
    this.lastTime = null;
    this.gameOver = false;
    
    // 최고 기록
    this.highScore = storage.get('dodge_highscore', 0);
    this.newHighScore = false;
    
    this.updateHUD();
  }
  
  bindEvents() {
    window.addEventListener('keydown', e => {
      if (e.code === 'ArrowLeft') this.keys.left = true;
      if (e.code === 'ArrowRight') this.keys.right = true;
      if ((e.code === 'KeyR' || e.code === 'Space') && this.gameOver) this.reset();
    });
    
    window.addEventListener('keyup', e => {
      if (e.code === 'ArrowLeft') this.keys.left = false;
      if (e.code === 'ArrowRight') this.keys.right = false;
    });
    
    this.canvas.addEventListener('click', () => {
      if (this.gameOver) this.reset();
    });
  }
  
  spawnObstacle() {
    const width = 30 + Math.random() * 40;
    const x = Math.max(5, Math.random() * (this.width - width - 10));
    const baseSpeed = 120 + Math.random() * 140;
    const speed = baseSpeed + (this.level-1) * 30 + this.score * 0.15;
    
    this.obstacles.push(new Obstacle(x, -width, width, width, speed));
  }
  
  updateHUD() {
    const scoreEl = document.getElementById('score');
    const levelEl = document.getElementById('level');
    const highEl = document.getElementById('highscore');
    const msgEl = document.getElementById('message');
    
    scoreEl.textContent = `점수: ${formatScore(Math.floor(this.score))}`;
    levelEl.textContent = `레벨: ${this.level}`;
    
    if (this.newHighScore) {
      highEl.textContent = `★최고: ${formatScore(this.highScore)}★`;
      highEl.classList.add('new-high');
    } else {
      highEl.textContent = `최고: ${formatScore(this.highScore)}`;
      highEl.classList.remove('new-high');
    }
    
    if (this.gameOver) {
      msgEl.classList.remove('hidden');
    } else {
      msgEl.classList.add('hidden');
    }
  }
  
  update(dt) {
    if (this.gameOver) return;
    
    // 플레이어 이동
    if (this.keys.left) this.player.move(-1, dt);
    if (this.keys.right) this.player.move(1, dt);
    this.player.x = Math.max(5, Math.min(this.width - this.player.width - 5, this.player.x));
    
    // 장애물 생성
    this.lastSpawn += dt * 1000;
    if (this.lastSpawn > this.spawnInterval) {
      this.spawnObstacle();
      this.lastSpawn = 0;
      if (this.spawnInterval > 350) this.spawnInterval *= 0.98;
    }
    
    // 장애물 업데이트 및 충돌 체크
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      const removed = obstacle.update(dt);
      
      if (collision(obstacle.getBounds(), this.player.getBounds())) {
        this.gameOver = true;
        this.sound.play('hit');
        this.particles.spawn(
          this.player.x + this.player.width/2,
          this.player.y + this.player.height/2,
          '#ff8b8b',
          {
            count: 28,
            type: 'bone',
            speed: { min: 100, max: 300 },
            size: { min: 10, max: 20 }
          }
        );
        
        if (Math.floor(this.score) > this.highScore) {
          this.highScore = Math.floor(this.score);
          this.newHighScore = true;
          storage.set('dodge_highscore', this.highScore);
        }
        this.updateHUD();
      }
      
      if (removed) {
        this.obstacles.splice(i, 1);
        this.score += 10;
        this.sound.play('score');
        
        this.particles.spawn(
          obstacle.x + obstacle.width/2,
          this.height - 10,
          '#9bffb3',
          {
            count: 8,
            type: 'bone',
            speed: { min: 50, max: 150 },
            size: { min: 8, max: 12 }
          }
        );
        
        const newLevel = Math.floor(this.score / 100) + 1;
        if (newLevel > this.level) {
          this.level = newLevel;
        }
        this.updateHUD();
      }
    }
    
    // 파티클 업데이트
    this.particles.update(dt);
  }
  
  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // 플레이어
    this.player.draw(this.ctx);
    
    // 장애물
    for (const obstacle of this.obstacles) {
      obstacle.draw(this.ctx);
    }
    
    // 파티클
    this.particles.draw(this.ctx);
    
    // 게임오버 오버레이
    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.4)';
      this.ctx.fillRect(0, 0, this.width, this.height);
    }
  }
  
  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = Math.min(0.05, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;
    
    this.update(dt);
    this.draw();
    
    requestAnimationFrame(this.loop.bind(this));
  }
  
  start() {
    this.reset();
    requestAnimationFrame(this.loop.bind(this));
  }
}