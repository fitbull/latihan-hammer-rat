import Phaser from 'phaser';
import './style.css';

const IS_MOBILE_PORTRAIT = window.matchMedia(
  '(max-width: 900px) and (orientation: portrait)'
).matches;
const mobileViewportRatio = Phaser.Math.Clamp(
  window.innerWidth / window.innerHeight,
  .44,
  .74
);
const W = IS_MOBILE_PORTRAIT ? 640 : 1000;
const H = IS_MOBILE_PORTRAIT ? Math.round(W / mobileViewportRatio) : 800;
const CANVAS_W = IS_MOBILE_PORTRAIT ? W : 1200;
const CANVAS_H = IS_MOBILE_PORTRAIT ? H : 900;
const VIEW_WORLD_W = IS_MOBILE_PORTRAIT ? W : H * (CANVAS_W / CANVAS_H);
const ARABIC_FONT = '"Noto Kufi Arabic", "Geeza Pro", Arial, sans-serif';
const UI_FONT = '"Nunito", Arial, sans-serif';
const TIMER_ENABLED = true;

const preloaderElements = {
  container: document.querySelector('#game-container'),
  root: document.querySelector('#preloader'),
  progress: document.querySelector('#preloader-progress'),
  bar: document.querySelector('#preloader-bar'),
  percentage: document.querySelector('#preloader-percentage'),
  status: document.querySelector('#preloader-status')
};

function updatePreloader(progress, status) {
  const percentage = Math.round(Phaser.Math.Clamp(progress, 0, 1) * 100);
  preloaderElements.bar.style.width = `${percentage}%`;
  preloaderElements.percentage.textContent = `${percentage}%`;
  preloaderElements.progress.setAttribute('aria-valuenow', String(percentage));
  if (status) preloaderElements.status.textContent = status;
}

function revealGame() {
  updatePreloader(1, 'Permainan sedia!');
  preloaderElements.container.classList.remove('is-loading');
  preloaderElements.container.setAttribute('aria-busy', 'false');
  preloaderElements.root.classList.add('is-complete');
  preloaderElements.root.addEventListener('transitionend', () => {
    preloaderElements.root.remove();
  }, { once: true });
}

const ROUND_DATA = [
  {
    number: 1,
    title: 'الجَوْلَةُ الأُولَى',
    target: 'المُذَكَّر',
    instruction: 'اِضْرِبْ كَلِمَةَ المُذَكَّرِ فَقَطْ',
    sign: 'اِضْرِبْ\nالمُذَكَّرَ فَقَطْ',
    words: [
      ['المَقْصِفُ', true, 'stage1-word-1'], ['المُعَلِّمَةُ', false, 'stage1-word-3'],
      ['القَرْيَةُ', false, 'stage1-word-7'], ['الفَصْلُ', true, 'stage1-word-2'],
      ['المِمْسَحَةُ', false, 'stage1-word-5'], ['الجَدَّةُ', false, 'stage1-word-8'],
      ['المُدِيرُ', true, 'stage1-word-4'], ['المَدْرَسَةُ', false, 'stage1-word-6'],
      ['المَعْهَدُ', true, 'stage1-word-9'], ['المُوَظَّفُ', true, 'stage1-word-10']
    ]
  },
  {
    number: 2,
    title: 'الجَوْلَةُ الثَّانِيَةُ',
    target: 'المُؤَنَّث',
    instruction: 'اِضْرِبْ كَلِمَةَ المُؤَنَّثِ فَقَطْ',
    sign: 'اِضْرِبْ\nالمُؤَنَّثَ فَقَطْ',
    words: [
      ['الأَبُ', false, 'stage2-word-1'], ['النَّظَافَةُ', true, 'stage2-word-5'],
      ['المَمَرَّاتُ', true, 'stage2-word-7'], ['الدَّرْسُ', false, 'stage2-word-2'],
      ['المَكْتَبَةُ', true, 'stage2-word-6'], ['العَامِلَةُ', true, 'stage2-word-8'],
      ['الطَّيْرُ', false, 'stage2-word-3'], ['المَدْرَسَةُ', true, 'stage2-word-4'],
      ['الفِنَاءُ', false, 'stage2-word-9'], ['الأُسْتَاذُ', false, 'stage2-word-10']
    ]
  }
];

const DESKTOP_HOLES = [
  [180, 568], [340, 568], [500, 568], [660, 568], [820, 568],
  [180, 688], [340, 688], [500, 688], [660, 688], [820, 688]
];
const MOBILE_HOLE_WIDTH = 261;
const MOBILE_HOLE_HEIGHT = 147;
const MOBILE_HOLE_ROW_GAP = 142;
const mobileHoleBottom = H - 88;
const MOBILE_HOLES = [3, 2, 3, 2].flatMap((count, rowIndex) => {
  const spacing = count === 3 ? 220 : 240;
  const y = mobileHoleBottom - (3 - rowIndex) * MOBILE_HOLE_ROW_GAP;
  return Array.from({ length: count }, (_, columnIndex) => [
    W / 2 + (columnIndex - (count - 1) / 2) * spacing,
    y
  ]);
});
const HOLES = IS_MOBILE_PORTRAIT ? MOBILE_HOLES : DESKTOP_HOLES;

function addText(scene, x, y, value, style = {}) {
  return scene.add.text(x, y, value, {
    fontFamily: style.arabic ? ARABIC_FONT : UI_FONT,
    fontSize: style.fontSize ?? '30px',
    fontStyle: style.fontStyle ?? 'bold',
    color: style.color ?? '#4a2916',
    align: style.align ?? 'center',
    direction: style.arabic ? 'rtl' : 'ltr',
    stroke: style.stroke,
    strokeThickness: style.strokeThickness ?? 0,
    lineSpacing: style.lineSpacing ?? 0,
    wordWrap: style.wordWrap,
  }).setOrigin(style.originX ?? .5, style.originY ?? .5);
}

function toArabicDigits(value) {
  return String(value).replace(/\d/g, digit => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
}

function makeButton(scene, x, y, width, label, onClick, options = {}) {
  const shadow = scene.add.rectangle(x, y + 7, width, options.height ?? 72, options.shadow ?? 0x994114)
    .setOrigin(.5).setStrokeStyle(3, options.stroke ?? 0x743114);
  const bg = scene.add.rectangle(x, y, width, options.height ?? 72, options.fill ?? 0xff7a26)
    .setOrigin(.5).setStrokeStyle(4, options.stroke ?? 0x743114).setInteractive();
  const text = addText(scene, x, y - 2, label, {
    arabic: options.arabic ?? true,
    fontSize: options.fontSize ?? '30px',
    color: options.color ?? '#ffffff',
    stroke: '#7b2d13', strokeThickness: 2
  });
  const items = [shadow, bg, text];
  bg.on('pointerover', () => scene.tweens.add({ targets: items, scaleX: 1.04, scaleY: 1.04, duration: 100 }));
  bg.on('pointerout', () => scene.tweens.add({ targets: items, scaleX: 1, scaleY: 1, duration: 100 }));
  bg.on('pointerdown', () => scene.tweens.add({ targets: items, y: '+=5', duration: 55, yoyo: true, onComplete: onClick }));
  return { bg, text, items };
}

function playTone(type = 'pop') {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = playTone.ctx ??= new AudioCtx();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  const presets = {
    start: [440, 740, .35, 'triangle'],
    pop: [300, 520, .12, 'sine'],
    hit: [520, 880, .2, 'triangle'],
    wrong: [180, 95, .28, 'sawtooth'],
    win: [520, 1040, .55, 'triangle']
  };
  const [from, to, duration, wave] = presets[type] ?? presets.pop;
  osc.type = wave;
  osc.frequency.setValueAtTime(from, now);
  osc.frequency.exponentialRampToValueAtTime(to, now + duration);
  gain.gain.setValueAtTime(.001, now);
  gain.gain.exponentialRampToValueAtTime(.16, now + .02);
  gain.gain.exponentialRampToValueAtTime(.001, now + duration);
  osc.start(now); osc.stop(now + duration);
}

class BaseScene extends Phaser.Scene {
  prepareView() {
    const camera = this.cameras.main;
    camera.setZoom(IS_MOBILE_PORTRAIT ? 1 : CANVAS_H / H);
    camera.centerOn(W / 2, H / 2);
  }

  addBackdrop(alpha = 1) {
    const bg = this.add.image(W / 2, H / 2, 'garden').setAlpha(alpha);
    const coverScale = Math.max(VIEW_WORLD_W / bg.width, H / bg.height);
    bg.setScale(coverScale);
    return bg;
  }

  addSystemPointer() {
    if (IS_MOBILE_PORTRAIT) {
      this.input.setDefaultCursor('default');
      return null;
    }
    this.input.setDefaultCursor('none');
    const pointerSprite = this.add.image(W / 2, H / 2, 'pointer')
      .setDisplaySize(84, 126)
      .setOrigin(.23, .18)
      .setDepth(200);
    this.input.on('pointermove', pointer => pointerSprite.setPosition(pointer.worldX, pointer.worldY));
    this.input.on('gameout', () => pointerSprite.setVisible(false));
    this.input.on('gameover', () => pointerSprite.setVisible(true));
    return pointerSprite;
  }

  addHoles() {
    HOLES.forEach(([x, y]) => {
      const holeWidth = IS_MOBILE_PORTRAIT ? MOBILE_HOLE_WIDTH : 191;
      const holeHeight = IS_MOBILE_PORTRAIT ? MOBILE_HOLE_HEIGHT : 108;
      this.add.image(x, y, 'rat-hole').setDisplaySize(holeWidth, holeHeight).setDepth(5);

      const frontEdge = [];
      for (let step = 0; step <= 24; step += 1) {
        const progress = step / 24;
        frontEdge.push(new Phaser.Math.Vector2(
          IS_MOBILE_PORTRAIT
            ? x - holeWidth / 2 + (holeWidth * progress)
            : x - 95 + (190 * progress),
          y + ((IS_MOBILE_PORTRAIT ? 19.5 : 15) * 4 * progress * (1 - progress))
        ));
      }

      const frontRim = this.add.image(x, y, 'rat-hole').setDisplaySize(holeWidth, holeHeight).setDepth(20);
      const frontRimMask = this.make.graphics({ add: false });
      frontRimMask.fillStyle(0xffffff);
      frontRimMask.fillPoints([
        ...frontEdge,
        new Phaser.Math.Vector2(IS_MOBILE_PORTRAIT ? x + holeWidth / 2 : x + 95, y + holeHeight / 2 + 6),
        new Phaser.Math.Vector2(IS_MOBILE_PORTRAIT ? x - holeWidth / 2 : x - 95, y + holeHeight / 2 + 6)
      ], true);
      frontRim.setMask(frontRimMask.createGeometryMask());
    });
  }

  addTopTitle(text) {
    const titleY = IS_MOBILE_PORTRAIT ? 72 : 85;
    this.add.rectangle(W / 2, titleY, IS_MOBILE_PORTRAIT ? 520 : 470, IS_MOBILE_PORTRAIT ? 92 : 105, 0xffd78f)
      .setStrokeStyle(5, 0x9a5a22);
    addText(this, W / 2, titleY, text, {
      arabic: true,
      fontSize: IS_MOBILE_PORTRAIT ? '34px' : '38px'
    });
  }

  confetti(count = 60) {
    const colors = [0xff5c5c, 0xffcb45, 0x3ccf8e, 0x43a7ef, 0xb567e8];
    for (let i = 0; i < count; i++) {
      const piece = this.add.rectangle(Phaser.Math.Between(40, 960), Phaser.Math.Between(-120, 0), 8, 18, Phaser.Utils.Array.GetRandom(colors))
        .setAngle(Phaser.Math.Between(0, 180)).setDepth(50);
      this.tweens.add({
        targets: piece, y: H + 40, x: `+=${Phaser.Math.Between(-100, 100)}`,
        angle: `+=${Phaser.Math.Between(180, 720)}`, duration: Phaser.Math.Between(1800, 3400),
        delay: Phaser.Math.Between(0, 1200), repeat: -1
      });
    }
  }
}

class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload() {
    this.load.on('progress', progress => {
      updatePreloader(progress * .94, 'Memuatkan aset permainan…');
    });
    this.load.on('loaderror', file => {
      console.error(`Asset failed to load: ${file.src}`);
    });

    this.load.image('cover-title', '/assets/cover-title.png');
    this.load.image('cover-start', '/assets/cover-start.png');
    this.load.image('garden', '/assets/garden-4x3.png');
    this.load.image('rat-hole', '/assets/rat-hole.png');
    this.load.image('hammer', '/assets/hammer-cursor.png');
    this.load.image('pointer', '/assets/pointer.png');
    this.load.image('mouse', '/assets/mouse.png');
    this.load.image('wrong', '/assets/wrong.png');
    this.load.image('correct', '/assets/correct.png');
    this.load.image('score-panel', '/assets/score-panel.png');
    this.load.image('time-panel', '/assets/time-panel.png');
    this.load.image('instruction-round-1', '/assets/instruction-round-1.png');
    this.load.image('instruction-round-2', '/assets/instruction-round-2.png');
    this.load.image('hole-instruction-round-1', '/assets/hole-instruction-round-1.png');
    this.load.image('hole-instruction-round-2', '/assets/hole-instruction-round-2.png');
    this.load.image('intro-stage-1-cloud', '/assets/intro-stage-1-cloud.png');
    this.load.image('intro-stage-2-cloud', '/assets/intro-stage-2-cloud.png');
    this.load.image('results-panel', '/assets/results-panel.png');
    this.load.image('results-home-button', '/assets/results-home-button.png');
    this.load.image('results-replay-button', '/assets/results-replay-button.png');
    this.load.image('results-party-popper', '/assets/results-party-popper.png');
    for (let score = 0; score <= 5; score += 1) {
      this.load.image(`results-stars-${score}`, `/assets/results-stars-${score}.png`);
    }
    for (let index = 1; index <= 10; index += 1) {
      this.load.image(`stage1-word-${index}`, `/assets/stage1-word-${index}-transparent.png`);
      this.load.image(`stage2-word-${index}`, `/assets/stage2-word-${index}-transparent.png`);
    }
  }
  async create() {
    this.textures.get('cover-title').add('trimmed', 0, 188, 54, 1546, 990);
    this.textures.get('cover-start').add('trimmed', 0, 175, 349, 1571, 381);
    this.textures.get('score-panel').add('hud', 0, 220, 176, 1480, 728);
    this.textures.get('time-panel').add('hud', 0, 220, 176, 1480, 728);
    this.textures.get('instruction-round-1').add('hud', 0, 60, 220, 1810, 650);
    this.textures.get('instruction-round-2').add('hud', 0, 60, 220, 1810, 650);
    this.textures.get('results-panel').add('trimmed', 0, 476, 58, 935, 960);
    this.textures.get('results-home-button').add('trimmed', 0, 178, 331, 1564, 418);
    this.textures.get('results-replay-button').add('trimmed', 0, 178, 331, 1565, 419);
    const starFrames = [
      [0, 326, 1911, 384], [0, 326, 1905, 385], [4, 326, 1901, 386],
      [6, 326, 1899, 386], [6, 326, 1899, 386], [9, 330, 1896, 382]
    ];
    starFrames.forEach(([x, y, width, height], score) => {
      this.textures.get(`results-stars-${score}`).add('trimmed', 0, x, y, width, height);
    });

    const bubble = this.make.graphics({ add: false });
    bubble.fillStyle(0x3b352f, .18);
    bubble.fillRoundedRect(11, 12, 218, 86, 23);
    bubble.fillTriangle(94, 96, 125, 96, 111, 127);
    bubble.fillStyle(0xf8f8f6, 1);
    bubble.lineStyle(3, 0x343434, 1);
    bubble.fillRoundedRect(5, 5, 218, 86, 23);
    bubble.strokeRoundedRect(5, 5, 218, 86, 23);
    bubble.fillTriangle(89, 89, 120, 89, 106, 120);
    bubble.beginPath();
    bubble.moveTo(89, 89); bubble.lineTo(106, 120); bubble.lineTo(120, 89);
    bubble.strokePath();
    bubble.generateTexture('word-dialog', 240, 132); bubble.destroy();

    updatePreloader(.96, 'Menyediakan tulisan…');
    if (document.fonts?.load) {
      await Promise.allSettled([
        document.fonts.load('800 32px "Noto Kufi Arabic"'),
        document.fonts.load('900 20px "Nunito"'),
        document.fonts.ready
      ]);
    }

    revealGame();
    this.scene.start('Cover');
  }
}

class CoverScene extends BaseScene {
  constructor() { super('Cover'); }
  create() {
    this.prepareView();
    this.addBackdrop();
    this.add.rectangle(W / 2, H / 2, VIEW_WORLD_W, H, 0xffffff, .45).setDepth(30);
    this.addHoles();

    let starting = false;
    const start = () => {
      if (starting) return;
      starting = true;
      playTone('start');
      this.scene.start('Intro', { round: 0 });
    };

    this.add.image(W / 2, IS_MOBILE_PORTRAIT ? H * .39 : 315, 'cover-title', 'trimmed')
      .setDisplaySize(IS_MOBILE_PORTRAIT ? 610 : 620, IS_MOBILE_PORTRAIT ? 391 : 397)
      .setDepth(40);
    const startButton = this.add.image(W / 2, IS_MOBILE_PORTRAIT ? H * .69 : 585, 'cover-start', 'trimmed')
      .setDisplaySize(IS_MOBILE_PORTRAIT ? 470 : 390, IS_MOBILE_PORTRAIT ? 114 : 95)
      .setDepth(41)
      .setInteractive({ pixelPerfect: true, alphaTolerance: 16 });
    const restingScaleX = startButton.scaleX;
    const restingScaleY = startButton.scaleY;
    startButton.on('pointerover', () => this.tweens.add({
      targets: startButton,
      scaleX: restingScaleX * 1.035,
      scaleY: restingScaleY * 1.035,
      duration: 110
    }));
    startButton.on('pointerout', () => this.tweens.add({
      targets: startButton,
      scaleX: restingScaleX,
      scaleY: restingScaleY,
      duration: 110
    }));
    startButton.on('pointerdown', () => this.tweens.add({
      targets: startButton,
      y: startButton.y + 6,
      duration: 65,
      yoyo: true,
      onComplete: start
    }));
    this.input.keyboard.once('keydown-SPACE', start);
    this.input.keyboard.once('keydown-ENTER', start);
    this.addSystemPointer();
  }
}

class IntroScene extends BaseScene {
  constructor() { super('Intro'); }
  init(data) { this.roundIndex = data.round ?? 0; }
  create() {
    this.prepareView();
    this.addBackdrop();
    this.addHoles();
    this.add.rectangle(W / 2, H / 2, VIEW_WORLD_W, H, 0xffffff, .45).setDepth(30);
    const introCloudKey = `intro-stage-${this.roundIndex + 1}-cloud`;
    const introCloud = this.add.image(W / 2, IS_MOBILE_PORTRAIT ? H * .5 : 410, introCloudKey)
      .setDisplaySize(IS_MOBILE_PORTRAIT ? 510 : 720, IS_MOBILE_PORTRAIT ? 340 : 480)
      .setDepth(40)
      .setInteractive({ pixelPerfect: true, alphaTolerance: 16 });
    let entering = false;
    const go = () => {
      if (entering) return;
      entering = true;
      playTone('start');
      this.scene.start('Game', { round: this.roundIndex });
    };
    const cloudScaleX = introCloud.scaleX;
    const cloudScaleY = introCloud.scaleY;
    introCloud.on('pointerover', () => this.tweens.add({
      targets: introCloud,
      scaleX: cloudScaleX * 1.025,
      scaleY: cloudScaleY * 1.025,
      duration: 110
    }));
    introCloud.on('pointerout', () => this.tweens.add({
      targets: introCloud,
      scaleX: cloudScaleX,
      scaleY: cloudScaleY,
      duration: 110
    }));
    introCloud.on('pointerdown', () => this.tweens.add({
      targets: introCloud,
      y: introCloud.y + 6,
      duration: 65,
      yoyo: true,
      onComplete: go
    }));
    this.input.keyboard.once('keydown-SPACE', go);
    this.input.keyboard.once('keydown-ENTER', go);
    this.addSystemPointer();
  }
}

class GameScene extends BaseScene {
  constructor() { super('Game'); }
  init(data) {
    this.roundIndex = data.round ?? 0;
    this.score = 0; this.seconds = 30; this.activeMouse = null; this.ended = false;
  }
  create() {
    this.prepareView();
    this.dataDef = ROUND_DATA[this.roundIndex];
    this.addBackdrop();
    this.addHoles();
    const instructionKey = `instruction-round-${this.roundIndex + 1}`;
    const holeInstructionKey = `hole-instruction-round-${this.roundIndex + 1}`;
    const mobileHoleInstructionWidth = 234;
    const mobileHoleInstructionHeight = 256.5;
    const holeInstructionY = IS_MOBILE_PORTRAIT
      ? MOBILE_HOLES[0][1] - MOBILE_HOLE_HEIGHT / 2 - mobileHoleInstructionHeight / 2
      : 418;
    this.add.image(IS_MOBILE_PORTRAIT ? W / 2 : 280, holeInstructionY, holeInstructionKey)
      .setDisplaySize(
        IS_MOBILE_PORTRAIT ? mobileHoleInstructionWidth : 141,
        IS_MOBILE_PORTRAIT ? mobileHoleInstructionHeight : 155
      )
      .setDepth(4);
    const scorePanelX = IS_MOBILE_PORTRAIT ? 78 : 73;
    const timePanelX = W - (IS_MOBILE_PORTRAIT ? 78 : 73);
    const topPanelY = IS_MOBILE_PORTRAIT ? 64 : 75.6;
    this.add.image(scorePanelX, topPanelY, 'score-panel', 'hud')
      .setDisplaySize(IS_MOBILE_PORTRAIT ? 145 : 136, IS_MOBILE_PORTRAIT ? 72 : 67).setDepth(25);
    this.add.image(timePanelX, topPanelY, 'time-panel', 'hud')
      .setDisplaySize(IS_MOBILE_PORTRAIT ? 145 : 136, IS_MOBILE_PORTRAIT ? 72 : 67).setDepth(25);
    this.add.image(IS_MOBILE_PORTRAIT ? W / 2 : 500, IS_MOBILE_PORTRAIT ? 222 : 102, instructionKey, 'hud')
      .setDisplaySize(IS_MOBILE_PORTRAIT ? 525 : 390, IS_MOBILE_PORTRAIT ? 188.75 : 140).setDepth(25);

    this.scoreText = addText(this, IS_MOBILE_PORTRAIT ? 106 : 100, IS_MOBILE_PORTRAIT ? 81 : 91.6, '٥ / ٠', {
      arabic: true, fontSize: '21px', color: '#29441c'
    }).setDepth(27);
    this.timerText = addText(this, W - (IS_MOBILE_PORTRAIT ? 51 : 46), IS_MOBILE_PORTRAIT ? 81 : 91.6, '٣٠', {
      arabic: true, fontSize: '23px', color: '#29441c'
    }).setDepth(27);
    this.input.setDefaultCursor('none');
    this.hammer = this.add.image(W / 2, H / 2, 'hammer')
      .setDisplaySize(124, 124)
      .setDepth(100)
      .setOrigin(.32, .32)
      .setAngle(-12)
      .setVisible(!IS_MOBILE_PORTRAIT);
    this.input.on('pointermove', p => this.hammer.setPosition(p.worldX, p.worldY));
    this.input.on('gameout', () => this.hammer.setVisible(false));
    this.input.on('gameover', () => this.hammer.setVisible(true));
    this.input.on('pointerdown', p => {
      this.tweens.killTweensOf(this.hammer);
      this.hammer.setVisible(true).setPosition(p.worldX, p.worldY).setAngle(-32);
      this.tweens.add({
        targets: this.hammer,
        angle: 18,
        y: p.worldY + 13,
        duration: 85,
        ease: 'Quad.In',
        yoyo: true,
        onComplete: () => {
          this.hammer.setAngle(-12);
          if (IS_MOBILE_PORTRAIT) this.hammer.setVisible(false);
        }
      });
    });
    this.countdown = this.time.addEvent({ delay: 1000, loop: true, callback: () => {
      if (this.ended || !TIMER_ENABLED) return;
      this.seconds -= 1; this.timerText.setText(toArabicDigits(this.seconds));
      if (this.seconds <= 5) this.timerText.setColor('#d43c2f');
      if (this.seconds <= 0) this.finishRound();
    }});
    this.time.delayedCall(500, () => this.spawnMouse());
  }
  spawnMouse() {
    if (this.ended || this.activeMouse) return;
    const spot = Phaser.Utils.Array.GetRandom(HOLES);
    const word = Phaser.Utils.Array.GetRandom(this.dataDef.words);
    const usesImageBubble = Boolean(word[2]);
    const container = this.add.container(spot[0], spot[1] + 90).setDepth(15);
    const dialogContainer = this.add.container(spot[0], spot[1] + 70).setDepth(30);
    const mouse = this.add.image(0, 0, 'mouse').setDisplaySize(139, 139).setAlpha(1);
    const pill = this.add.image(0, usesImageBubble ? -120 : -105, word[2] ?? 'word-dialog')
      .setDisplaySize(usesImageBubble ? 143 : 184, usesImageBubble ? 128 : 101)
      .setVisible(false);
    const label = addText(this, 0, -116, word[0], {
      arabic: true,
      fontSize: '25px',
      color: '#392617'
    }).setVisible(false);
    const marker = this.add.image(0, usesImageBubble ? -120 : -112, 'wrong').setDisplaySize(92, 92).setVisible(false);
    marker.setData('targetScaleX', marker.scaleX);
    marker.setData('targetScaleY', marker.scaleY);
    const hit = this.add.rectangle(0, -42, 190, 260, 0xffffff, 0);
    container.add([mouse, hit]);
    dialogContainer.add([pill, label, marker]);

    const emergenceMaskShape = this.make.graphics({ add: false });
    emergenceMaskShape.fillStyle(0xffffff);
    const openingHalfWidth = 56;
    const openingCurve = [];
    for (let step = 24; step >= 0; step -= 1) {
      const progress = step / 24;
      openingCurve.push(new Phaser.Math.Vector2(
        spot[0] - openingHalfWidth + (openingHalfWidth * 2 * progress),
        spot[1] + 15 + (12 * 4 * progress * (1 - progress))
      ));
    }
    emergenceMaskShape.fillPoints([
      new Phaser.Math.Vector2(spot[0] - openingHalfWidth, -100),
      new Phaser.Math.Vector2(spot[0] + openingHalfWidth, -100),
      ...openingCurve
    ], true);
    container.setMask(emergenceMaskShape.createGeometryMask());
    container.setData('correct', word[1]);
    container.setData('word', word[0]);
    container.setData('marker', marker);
    container.setData('dialogContainer', dialogContainer);
    container.setData('emergenceMaskShape', emergenceMaskShape);
    this.activeMouse = container;
    hit.on('pointerdown', () => this.hitMouse(container));
    this.tweens.add({
      targets: container,
      y: spot[1] - 4,
      duration: 260,
      ease: 'Back.Out'
    });
    this.tweens.add({
      targets: dialogContainer,
      y: spot[1] - 14,
      duration: 260,
      ease: 'Back.Out',
      onComplete: () => {
        pill.setVisible(true);
        label.setVisible(!usesImageBubble);
        hit.setInteractive();
        playTone('pop');
      }
    });
    container.lifeEvent = this.time.delayedCall(1600, () => this.hideMouse(container, false));
  }
  hitMouse(container) {
    if (this.ended || container !== this.activeMouse) return;
    container.lifeEvent?.remove(false);
    const marker = container.getData('marker');
    const dialogContainer = container.getData('dialogContainer');
    if (container.getData('correct')) {
      this.score += 1;
      this.scoreText.setText(`٥ / ${toArabicDigits(this.score)}`);
      marker.setTexture('correct').setVisible(true).setScale(0);
      playTone('hit');
      this.tweens.add({ targets: container, scaleX: 1.15, scaleY: .72, angle: 8, duration: 90, yoyo: true });
      this.tweens.add({ targets: this.scoreText, scaleX: 1.35, scaleY: 1.35, duration: 120, yoyo: true });
    } else {
      marker.setTexture('wrong').setVisible(true).setScale(0);
      playTone('wrong');
      this.cameras.main.shake(140, .007);
      this.tweens.add({ targets: [container, dialogContainer], x: '+=9', duration: 45, yoyo: true, repeat: 3 });
    }
    this.tweens.add({
      targets: marker,
      scaleX: marker.getData('targetScaleX'),
      scaleY: marker.getData('targetScaleY'),
      duration: 180,
      ease: 'Back.Out'
    });
    if (this.score >= 5) {
      this.time.delayedCall(900, () => this.finishRound());
    } else {
      this.time.delayedCall(850, () => this.hideMouse(container, true));
    }
  }
  hideMouse(container, fast) {
    if (!container?.active) return;
    const dialogContainer = container.getData('dialogContainer');
    this.tweens.add({ targets: [container, dialogContainer], y: '+=100', alpha: fast ? .35 : 1, duration: 170, onComplete: () => {
      if (this.activeMouse === container) this.activeMouse = null;
      container.clearMask(true);
      container.getData('emergenceMaskShape')?.destroy();
      dialogContainer?.destroy();
      container.destroy();
      this.time.delayedCall(Phaser.Math.Between(180, 480), () => this.spawnMouse());
    }});
  }
  finishRound() {
    if (this.ended) return;
    this.ended = true;
    this.countdown?.remove(false);
    if (this.activeMouse) {
      this.activeMouse.clearMask(true);
      this.activeMouse.getData('emergenceMaskShape')?.destroy();
      this.activeMouse.getData('dialogContainer')?.destroy();
      this.activeMouse.destroy();
      this.activeMouse = null;
    }
    const scores = this.registry.get('scores') ?? [0, 0];
    scores[this.roundIndex] = this.score;
    this.registry.set('scores', scores);
    playTone(this.score >= 3 ? 'win' : 'wrong');
    if (this.roundIndex === 0) {
      this.scene.start('Intro', { round: 1 });
    } else {
      this.scene.start('Results', { round: this.roundIndex, score: this.score });
    }
  }
}

class ResultsScene extends BaseScene {
  constructor() { super('Results'); }

  addCornerConfetti(count = 96) {
    const colors = [0xff3f54, 0xffc629, 0x00a984, 0x087fbd, 0xf07cae];
    for (let index = 0; index < count; index += 1) {
      const fromLeft = index % 2 === 0;
      const startX = fromLeft ? 29 : W - 29;
      const startY = 750;
      const endX = fromLeft
        ? Phaser.Math.Between(20, 350)
        : Phaser.Math.Between(W - 350, W - 20);
      const piece = this.add.rectangle(
        startX,
        startY,
        Phaser.Math.Between(6, 12),
        Phaser.Math.Between(14, 29),
        Phaser.Utils.Array.GetRandom(colors)
      ).setDepth(35).setAngle(Phaser.Math.Between(0, 180));
      this.tweens.add({
        targets: piece,
        x: endX,
        y: startY - Phaser.Math.Between(190, 480),
        angle: `+=${Phaser.Math.Between(240, 760)}`,
        alpha: 0,
        duration: Phaser.Math.Between(850, 1550),
        delay: Phaser.Math.Between(0, 950),
        repeat: -1,
        repeatDelay: Phaser.Math.Between(50, 320),
        ease: 'Cubic.Out'
      });
    }
  }

  create() {
    this.prepareView();
    const scores = this.registry.get('scores') ?? [0, 0];
    this.addBackdrop();
    this.addHoles();
    this.add.rectangle(W / 2, H / 2, VIEW_WORLD_W, H, 0xffffff, .52).setDepth(30);
    const resultsButtonY = IS_MOBILE_PORTRAIT ? H - 115 : 690;
    const popperY = IS_MOBILE_PORTRAIT ? H - 78 : 713;
    this.add.image(IS_MOBILE_PORTRAIT ? 25 : 45, popperY, 'results-party-popper')
      .setDisplaySize(IS_MOBILE_PORTRAIT ? 154 : 189, IS_MOBILE_PORTRAIT ? 154 : 189)
      .setDepth(34);
    this.add.image(IS_MOBILE_PORTRAIT ? W - 25 : W - 45, popperY, 'results-party-popper')
      .setDisplaySize(IS_MOBILE_PORTRAIT ? 154 : 189, IS_MOBILE_PORTRAIT ? 154 : 189)
      .setFlipX(true)
      .setDepth(34);
    this.addCornerConfetti();

    const resultsPanelY = IS_MOBILE_PORTRAIT ? Math.min(H * .47, H - 400) : 345;
    this.add.image(W / 2, resultsPanelY, 'results-panel', 'trimmed')
      .setDisplaySize(IS_MOBILE_PORTRAIT ? 540 : 486, IS_MOBILE_PORTRAIT ? 556 : 500)
      .setDepth(40);
    this.add.image(W / 2, resultsPanelY + (IS_MOBILE_PORTRAIT ? 32 : 30), `results-stars-${Phaser.Math.Clamp(scores[0], 0, 5)}`, 'trimmed')
      .setDisplaySize(IS_MOBILE_PORTRAIT ? 326 : 297, IS_MOBILE_PORTRAIT ? 66 : 60)
      .setDepth(41);
    this.add.image(W / 2, resultsPanelY + (IS_MOBILE_PORTRAIT ? 202 : 183), `results-stars-${Phaser.Math.Clamp(scores[1], 0, 5)}`, 'trimmed')
      .setDisplaySize(IS_MOBILE_PORTRAIT ? 326 : 297, IS_MOBILE_PORTRAIT ? 66 : 60)
      .setDepth(41);

    const addResultsButton = (x, texture, onClick) => {
      const button = this.add.image(x, resultsButtonY, texture, 'trimmed')
        .setDisplaySize(IS_MOBILE_PORTRAIT ? 270 : 248, IS_MOBILE_PORTRAIT ? 72 : 66)
        .setDepth(42)
        .setInteractive({ pixelPerfect: true, alphaTolerance: 16 });
      const restScaleX = button.scaleX;
      const restScaleY = button.scaleY;
      button.on('pointerover', () => this.tweens.add({
        targets: button,
        scaleX: restScaleX * 1.035,
        scaleY: restScaleY * 1.035,
        duration: 100
      }));
      button.on('pointerout', () => this.tweens.add({
        targets: button,
        scaleX: restScaleX,
        scaleY: restScaleY,
        duration: 100
      }));
      button.on('pointerdown', () => this.tweens.add({
        targets: button,
        y: button.y + 5,
        duration: 55,
        yoyo: true,
        onComplete: onClick
      }));
    };

    addResultsButton(IS_MOBILE_PORTRAIT ? 170 : 320, 'results-home-button', () => {
      this.registry.set('scores', [0, 0]);
      this.scene.start('Cover');
    });
    addResultsButton(IS_MOBILE_PORTRAIT ? W - 170 : 680, 'results-replay-button', () => {
      this.registry.set('scores', [0, 0]);
      this.scene.start('Intro', { round: 0 });
    });
    playTone('win');
    this.addSystemPointer();
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-container',
  width: CANVAS_W,
  height: CANVAS_H,
  backgroundColor: '#86d8f1',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  render: { antialias: true, pixelArt: false },
  input: { activePointers: 3 },
  scene: [BootScene, CoverScene, IntroScene, GameScene, ResultsScene]
});
