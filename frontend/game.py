import json, pygame, random, requests, time, sys
from pprint import pprint

terminate = False

pygame.init()
pygame.display.set_caption("Starship")
clock = pygame.time.Clock()

# Import Files

class AllData(object):
    def __init__(self):
        self.imgShip          = pygame.image.load('resource/ship.png')
        self.imgMonsterPink1  = pygame.image.load('resource/monster-pink1.png')
        self.imgMonsterPink2  = pygame.image.load('resource/monster-pink2.png')
        self.imgMonsterBlue1  = pygame.image.load('resource/monster-blue1.png')
        self.imgMonsterBlue2  = pygame.image.load('resource/monster-blue2.png')
        self.imgMonsterWhite1 = pygame.image.load('resource/monster-white1.png')
        self.imgMonsterWhite2 = pygame.image.load('resource/monster-white2.png')
        self.imgMonsterBlack1 = pygame.image.load('resource/monster-black1.png')
        self.imgMonsterBlack2 = pygame.image.load('resource/monster-black2.png')

        self.imgBulletPink    = pygame.image.load('resource/bullet-pink.png')
        self.imgBulletBlue    = pygame.image.load('resource/bullet-blue.png')
        self.imgBulletWhite   = pygame.image.load('resource/bullet-white.png')
        self.imgBulletBlack   = pygame.image.load('resource/bullet-black.png')

        self.imgBackground    = pygame.image.load('resource/background.png')

        self.imgWeaponOffline = pygame.image.load('resource/weapon-offline.png')
        self.imgWeaponPink    = pygame.image.load('resource/weapon-pink.png')
        self.imgWeaponBlue    = pygame.image.load('resource/weapon-blue.png')
        self.imgWeaponWhite   = pygame.image.load('resource/weapon-white.png')
        self.imgWeaponBlack   = pygame.image.load('resource/weapon-black.png')

        self.imgWaitEngineer = []
        self.imgWaitEngineer.append(pygame.image.load('resource/StartScreen-0.png'))
        self.imgWaitEngineer.append(pygame.image.load('resource/StartScreen-1.png'))
        self.imgWaitEngineer.append(pygame.image.load('resource/StartScreen-2.png'))
        self.imgWaitEngineer.append(pygame.image.load('resource/StartScreen-3.png'))
        self.imgGameOver = pygame.image.load('resource/GameOverScreen.png')
        self.imgGameWin  = pygame.image.load('resource/YouWinScreen.png')


class Bullet(object):
    def __init__(self, x, y):
        self.x   = x
        self.y   = y
        self.hit = False
        self.kind = data.weapon
    def move(self):
        self.y -= 10
        if self.y <= 0:
            self.hit = True
    def checkHit(self):
        for i in range(len(data.monsterX)):
            if not data.monsterDie[i]:
                x = data.gridPositionX[data.monsterX[i]] + 17.5
                y = data.gridPositionY[data.monsterY[i]] + 17.5
                if abs(self.x - x) < 20 and abs(self.y - y) < 20:
                    if self.kind == data.monsterType[i]:
                        destroyMonster(data.monsterID[i])
                    self.hit = True
                    break
    def draw(self):
        if   self.kind == 'pink' : img = data.imgBulletPink
        elif self.kind == 'blue' : img = data.imgBulletBlue
        elif self.kind == 'white': img = data.imgBulletWhite
        elif self.kind == 'black': img = data.imgBulletBlack
        data.screen.blit(img, (self.x-17.5,self.y-17.5))

data = AllData()

SERVER_URL = 'https://starship-server.herokuapp.com'

def setStateFromServer():
    r = requests.get(SERVER_URL + '/state')

    state = r.json()
    print state
    data.gameStarted = state['gameStarted']
    print 'hi'
    data.gameOver    = state['gameOver']
    data.gameWon     = state['gameWon']
    data.monsterID   = [enemy['id'] for enemy in state['enemies']]
    data.monsterX    = [enemy['x'] for enemy in state['enemies']]
    data.monsterY    = [enemy['y'] for enemy in state['enemies']]
    data.monsterDie  = [enemy['isDestroyed'] for enemy in state['enemies']]
    data.monsterType = [enemy['kind'] for enemy in state['enemies']]
    try:    data.weapon = state['weapon']['color']
    except: data.weapon = 'hahahahaha'
    return r.json()

def destroyMonster(ID):
    r = requests.get(SERVER_URL + '/destroy/enemy/' + str(ID))
    return r.json()    

data.gridPositionX = []
data.gridPositionY = []

for i in range(15):
    data.gridPositionX.append(  40+35*i)
    data.gridPositionY.append(37.5+35*i)

data.screen = pygame.display.set_mode((800,600))
data.shipX = 7

data.time = 0
data.animation = True
data.bulletList = []

black = 0,0,0

# requests.get(SERVER_URL + '/newGame')

setStateFromServer()

while terminate == False:

    while not data.gameStarted:
        setStateFromServer()
        data.screen.fill(black)
        data.screen.blit(data.imgWaitEngineer[data.time%4], (0,0))
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                sys.exit()
        clock.tick(3)
        data.time += 1
        pygame.display.flip()

    status = setStateFromServer()
    pprint(status)

    data.screen.fill(black)

    # Weapon Interface

    if   data.weapon == 'pink' : img = data.imgWeaponPink
    elif data.weapon == 'blue' : img = data.imgWeaponBlue
    elif data.weapon == 'black': img = data.imgWeaponBlack
    elif data.weapon == 'white': img = data.imgWeaponWhite
    else:                        img = data.imgWeaponOffline
    data.screen.blit(img, (590,0))

    data.screen.blit(data.imgBackground, (40,37.5))

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            sys.exit()
        elif event.type == pygame.KEYDOWN:
            if   event.key == pygame.K_LEFT  and data.shipX >  0: data.shipX -= 1
            elif event.key == pygame.K_RIGHT and data.shipX < 14: data.shipX += 1
            if   event.key == pygame.K_SPACE and not data.weapon == 'hahahahaha':
                x = data.gridPositionX[data.shipX]+17.5
                y = data.gridPositionY[14]
                b = Bullet(x,y)
                data.bulletList.append(b)

    for bullet in data.bulletList:
        if not bullet.hit:
            bullet.move()
            bullet.draw()
            bullet.checkHit()
        else:
            data.bulletList.remove(bullet)

    x = data.gridPositionX[data.shipX]-17.5
    y = data.gridPositionY[14]
    data.screen.blit(data.imgShip, (x,y))

    for i in range(len(data.monsterX)):
        if not data.monsterDie[i]:
            if   data.monsterType[i] == 'pink':
                if data.animation: img = data.imgMonsterPink1
                else:              img = data.imgMonsterPink2
            elif data.monsterType[i] == 'blue':
                if data.animation: img = data.imgMonsterBlue1
                else:              img = data.imgMonsterBlue2
            elif data.monsterType[i] == 'white':
                if data.animation: img = data.imgMonsterWhite1
                else:              img = data.imgMonsterWhite2
            elif data.monsterType[i] == 'black':
                if data.animation: img = data.imgMonsterBlack1
                else:              img = data.imgMonsterBlack2

            try:
                x = data.gridPositionX[data.monsterX[i]]
                y = data.gridPositionY[data.monsterY[i]]
                data.screen.blit(img,(x,y))
            except:
                pass

    if data.time%2 == 0:
        data.animation = not data.animation

    clock.tick(60)
    data.time += 1
    pygame.display.flip()

    while data.gameWon:
        data.bulletList = []
        data.screen.fill(black)
        data.screen.blit(data.imgGameWin, (0,0))
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                sys.exit()
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_RETURN:
                    requests.get(SERVER_URL + '/newGame')
                    setStateFromServer()
                    continue
        clock.tick(3)
        pygame.display.flip()

    while data.gameOver:
        data.bulletList = []
        data.screen.fill(black)
        data.screen.blit(data.imgGameOver, (0,0))
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                sys.exit()
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_RETURN:
                    requests.get(SERVER_URL + '/newGame')
                    setStateFromServer()
                    continue
        clock.tick(3)
        pygame.display.flip()
