var Canvas = <HTMLCanvasElement>document.getElementById("render");
var ctx = Canvas.getContext("2d");
var back = new Image(32, 32);
back.src = "Background.bmp";
var player = new Image(32, 32);
player.src = "Player.png";
var zombie = new Image(32, 32);
zombie.src = "Zombie.png";
var Run = false;
class World {
    public EntityQunatity:number = 100;
    public CamraX = 0;
    public CamraY = 0;
    public SizeX = 500;
    public SizeY = 500;
    public EntityList: Entity[] = new Array<Entity>(10);
    public PlayerId = -1;
    public Dif = 1;
    public SpawnCount = 1;
    public KillCount = 0;
    constructor() {
        for (var i = 0; i < this.EntityQunatity;++i) {
            this.EntityList[i] = new Entity(0,0);
            this.EntityList[i].Alive = false;
        }
    }
    public Update() {
        for (var i = 0; i < this.EntityQunatity; ++i) {
            if (this.EntityList[i].Alive == true) {
                this.EntityList[i].Update(this);
            }
        }
    }
    public Add(ent:Entity) {
        for (var i = 0; i < this.EntityQunatity; ++i) {
            if (this.EntityList[i].Alive == false) {
                if (ent instanceof EntityPlayer) {
                    this.PlayerId = i;
                }
                ent.Id = i;
                this.EntityList[i] = ent;
                return i;
            }
        }
    }
}
class Entity {
    public Colour = "#000000";
    public Fric = 2;
    public XSize = 20;
    public YSize = 20;
    public X = 0;
    public Y = 0;
    public R = 0;
    public MX = 0;
    public MY = 0;
    public MR = 0;
    public Id = 0;
    public Speed = 3;
    public Alive = true;
    constructor(x, y) {
        this.X = x;
        this.Y = y;
    }
    public Sign(sign: number) {
        if (sign > 0) {
            return 1;
        }
        if (sign < 0) {
            return -1;
        }
        return 0;
    }
    public AtSpeed(to: number, from: number, speed: number) {
        if (Math.abs(to - from) < speed) {
            speed = Math.abs(to - from);
        }
        return this.Sign(to-from) * speed;
    }
    public Update(world: World) {
        this.UpdateColl(world);
        this.UpdateMove(world);
    }
    public UpdateMove(world: World) {
        if (this.X + this.MX + (this.XSize / 2) > world.SizeX || this.X + this.MX - (this.XSize / 2) < 0) { this.MX = 0; }
        if (this.Y + this.MY + (this.YSize / 2) > world.SizeY || this.Y + this.MY - (this.YSize / 2) < 0) { this.MY = 0; }
        this.X += this.MX;
        this.Y += this.MY;
        this.R += this.MR;
        this.MX /= this.Fric;
        this.MY /= this.Fric;
        this.MR /= this.Fric;
        if (this.R < 0) { this.R += 360; }
        if (this.R > 360) { this.R -= 360; }
    }
    public UpdateColl(world: World) {
        for (var i = this.Id + 1; i < world.EntityQunatity; ++i) {
            if (world.EntityList[i].Alive == true) {
                var X = (this.X - world.EntityList[i].X);
                if (Math.abs(X) < (this.XSize / 2) + (world.EntityList[i].XSize / 2) || Math.abs(X + this.MX + world.EntityList[i].MX) < (this.XSize / 2) + (world.EntityList[i].XSize / 2)) {
                    var Y = (this.Y - world.EntityList[i].Y);
                    if (Math.abs(Y) < (this.YSize / 2) + (world.EntityList[i].YSize / 2) || Math.abs(Y + this.MY + world.EntityList[i].MY) < (this.YSize / 2) + (world.EntityList[i].YSize / 2)) {
                        //Do collition
                        this.MX = 0;
                        this.MY = 0;
                        world.EntityList[i].MX = 0;
                        world.EntityList[i].MY = 0;
                        if (this instanceof EntitySpawner) {
                            if (world.EntityList[i] instanceof EntityPlayer) {
                                this.Alive = false;
                                ++world.Dif;
                                ++world.SpawnCount;
                            }
                        }
                        if (world.EntityList[i] instanceof EntitySpawner) {
                            if (this instanceof EntityPlayer) {
                                world.EntityList[i].Alive = false;
                                ++world.Dif;
                                ++world.SpawnCount;
                            }
                        }
                        if (world.EntityList[i] instanceof EntityBullet || this instanceof EntityBullet) {
                            if (!(this instanceof EntitySpawner)) { this.Alive = false; world.Dif += 0.02; }
                            if (!(world.EntityList[i] instanceof EntitySpawner)) { world.EntityList[i].Alive = false; world.Dif += 0.02; }
                        }
                        if (this instanceof EntityMelee) {
                            if (world.EntityList[i] instanceof EntityPlayer) {
                                world.EntityList[i].Alive = false;
                                ++world.KillCount;
                            }
                        }
                        if (world.EntityList[i] instanceof EntityMelee) {
                            if (this instanceof EntityPlayer) {
                                this.Alive = false;
                                ++world.KillCount;
                            }
                        }
                    }
                }
            }
        }
    }
}
class EntityMelee extends Entity {
    constructor(x, y) {
        super(x, y);
        this.Speed = 2;

        this.Colour = "#00AA00";
    }
    public Update(world: World) {
        var angletolook = Math.atan2(world.EntityList[world.PlayerId].Y - this.Y, world.EntityList[world.PlayerId].X - this.X);
        angletolook = angletolook * (180 / Math.PI);
        if (this.Sign(angletolook) == -1) {
            angletolook -= 360;
        }
        this.R = angletolook;
        this.MX = this.Speed * Math.cos(this.R * (Math.PI / 180));
        this.MY = this.Speed * Math.sin(this.R * (Math.PI / 180));
        super.Update(world);
    }
}
class EntityPlayer extends Entity {
    public Fire = false;//Fire
    public CanFire = true;//Lift fire ban
    public Forward = false;//Move forward
    public Backward = false;//Move Backwards
    public Left = false;//Move left
    public Right = false;//Move right
    public LL = false;//Look left
    public LR = false;//Look right
    constructor(x, y) {
        super(x, y);
        this.Id = 10;
        this.Colour = "#0000FF";
    }
    public Update(world: World) {
        super.Update(world);
        if (this.LR) { this.R += 12; }
        if (this.LL) { this.R -= 12; }
        if (this.Forward) { this.MoveForward(); }
        if (this.Backward) { this.MoveBackward(); }
        if (this.Left) { this.MoveLeft(); }
        if (this.Right) { this.MoveRight(); }
        if (this.Fire == true) {
            if (this.CanFire == true) {
                world.Add(new EntityBullet(this.X, this.Y,this.R));
                this.CanFire = false;
            }
            this.Fire = false;
        }
    }
    public MoveForward() {
        this.MX = this.Speed * Math.cos((this.R + 0) * (Math.PI / 180));
        this.MY = this.Speed * Math.sin((this.R + 0) * (Math.PI / 180));
    }
    public MoveBackward() {
        this.MX = this.Speed * Math.cos((this.R + 180) * (Math.PI / 180));
        this.MY = this.Speed * Math.sin((this.R + 180) * (Math.PI / 180));
    }
    public MoveLeft() {
        this.MX = this.Speed * Math.cos((this.R + 90) * (Math.PI / 180));
        this.MY = this.Speed * Math.sin((this.R + 90) * (Math.PI / 180));
    }
    public MoveRight() {
        this.MX = this.Speed * Math.cos((this.R - 90) * (Math.PI / 180));
        this.MY = this.Speed * Math.sin((this.R - 90) * (Math.PI / 180));
    }
}
class EntityBullet extends Entity {
    constructor(x, y,r) {
        super(x, y);
        this.R = r;
        this.Fric = 1;
        this.Speed = 6;
        this.X += 24 * Math.cos(this.R * (Math.PI / 180));
        this.Y += 24 * Math.sin(this.R * (Math.PI / 180));
        this.MX = this.Speed * Math.cos(this.R * (Math.PI / 180));
        this.MY = this.Speed * Math.sin(this.R * (Math.PI / 180));
        this.Colour= "#000000"
        this.XSize = 6;
        this.YSize = 6;
    }
    public Update(world:World) {
        this.UpdateColl(world);
        if (this.X + this.MX + (this.XSize / 2) > world.SizeX || this.X + this.MX - (this.XSize / 2) < 0) { this.Alive = false; }
        if (this.Y + this.MY + (this.YSize / 2) > world.SizeY || this.Y + this.MY - (this.YSize / 2) < 0) { this.Alive = false; }
        super.UpdateMove(world);
    }
}
class EntitySpawner extends Entity {
    public SpawnTimer = 0;
    public SpawnMaxTimer = 0;
    constructor(x, y) {
        super(x, y);
        this.SpawnMaxTimer = 40 + (Math.random() * 50);
        this.Colour = "#FFFF00";
    }
    public Update(world: World) {
        super.Update(world);
        if (this.SpawnTimer >= this.SpawnMaxTimer) {
            var i = world.Add(new EntityMelee(this.X, this.Y + 20));
            if (i != -1) {
                //world.EntityList[i].Speed *= world.Dif;
            }
            this.SpawnTimer = 0;
        }
        else {
            ++this.SpawnTimer;
        }
    }
}
var world: World = new World();
for (var i = 0; i < 10; ++i) {
    var raX = Math.random() * world.SizeX;
    while (Math.abs(raX - world.SizeX / 2) < 100 && raX > 10 && raX < world.SizeX-10) {
        raX = Math.random() * world.SizeX;
    }
    var raY = Math.random() * world.SizeY;;
    while (Math.abs(raY - world.SizeY / 2) < 100 && raY > 10 && raY < world.SizeY - 10) {
        raY = Math.random() * world.SizeY;
    }
    world.Add(new EntitySpawner(raX, raY));
}
world.Add(new EntityPlayer(world.SizeX/2,world.SizeY/2));
Canvas.width = world.SizeX;
Canvas.height = world.SizeY;
function Main() {
    if (Run == true) {
        //GameLogic
        if (world.EntityList[world.PlayerId].Alive == false) {
            document.location.href = "Lose.html";
        }
        if (world.SpawnCount == 11) {
            document.location.href = "Win.html";
        }
        world.Update();
        //Render
        ctx.clearRect(0, 0, world.SizeX, world.SizeY);
        ctx.drawImage(back, 0, 0, world.SizeX, world.SizeY);
        for (var i = 0; i < world.EntityQunatity; ++i) {
            if (world.EntityList[i].Alive == true) {
                ctx.save();
                if (ctx.fillStyle != world.EntityList[i].Colour) {
                    ctx.fillStyle = world.EntityList[i].Colour;
                }
                ctx.translate(world.EntityList[i].X, world.EntityList[i].Y);
                ctx.rotate(world.EntityList[i].R * (Math.PI / 180));
                if (world.EntityList[i] instanceof EntityMelee) {
                    ctx.drawImage(zombie, - (world.EntityList[i].XSize / 2), - (world.EntityList[i].YSize / 2), world.EntityList[i].XSize, world.EntityList[i].YSize);
                }
                else if (world.EntityList[i] instanceof EntityPlayer) {
                    ctx.drawImage(player, - (world.EntityList[i].XSize / 2), - (world.EntityList[i].YSize / 2), world.EntityList[i].XSize, world.EntityList[i].YSize);
                }
                else {
                ctx.fillRect(- (world.EntityList[i].XSize / 2), - (world.EntityList[i].YSize / 2), world.EntityList[i].XSize, world.EntityList[i].YSize);
                }
                ctx.restore();
            }
        }
    }
}
//
function HandleKeyDown(e) {
    var key = e.keyCode || e.which;
    if (key == 87) {//W
        (<EntityPlayer>world.EntityList[world.PlayerId]).Forward = true;
    }
    if (key == 83) {//S
        (<EntityPlayer>world.EntityList[world.PlayerId]).Backward = true;
    }
    if (key == 65) {//A
        (<EntityPlayer>world.EntityList[world.PlayerId]).LL = true;
    }
    if (key == 68) {//D
        (<EntityPlayer>world.EntityList[world.PlayerId]).LR = true;
    }
    if (key == 32) {
        (<EntityPlayer>world.EntityList[world.PlayerId]).Fire = true;
    }
}
function HandleKeyUp(e) {
    var key = e.keyCode || e.which;
    if (key == 87) {//W
        (<EntityPlayer>world.EntityList[world.PlayerId]).Forward = false;
    }
    if (key == 83) {//S
        (<EntityPlayer>world.EntityList[world.PlayerId]).Backward = false;
    }
    if (key == 65) {//A
        (<EntityPlayer>world.EntityList[world.PlayerId]).LL = false;
    }
    if (key == 68) {//D
        (<EntityPlayer>world.EntityList[world.PlayerId]).LR = false;
    }
    if (key == 32) {
        (<EntityPlayer>world.EntityList[world.PlayerId]).CanFire = true;
    }
}

document.addEventListener("keydown", HandleKeyDown);
document.addEventListener("keyup", HandleKeyUp);
setInterval(Main, 50);