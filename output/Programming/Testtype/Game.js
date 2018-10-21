var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Canvas = document.getElementById("render");
var ctx = Canvas.getContext("2d");
var back = new Image(32, 32);
back.src = "Background.bmp";
var player = new Image(32, 32);
player.src = "Player.png";
var zombie = new Image(32, 32);
zombie.src = "Zombie.png";
var Run = false;
var World = (function () {
    function World() {
        this.EntityQunatity = 100;
        this.CamraX = 0;
        this.CamraY = 0;
        this.SizeX = 500;
        this.SizeY = 500;
        this.EntityList = new Array(10);
        this.PlayerId = -1;
        this.Dif = 1;
        this.SpawnCount = 1;
        this.KillCount = 0;
        for (var i = 0; i < this.EntityQunatity; ++i) {
            this.EntityList[i] = new Entity(0, 0);
            this.EntityList[i].Alive = false;
        }
    }
    World.prototype.Update = function () {
        for (var i = 0; i < this.EntityQunatity; ++i) {
            if (this.EntityList[i].Alive == true) {
                this.EntityList[i].Update(this);
            }
        }
    };
    World.prototype.Add = function (ent) {
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
    };
    return World;
})();
var Entity = (function () {
    function Entity(x, y) {
        this.Colour = "#000000";
        this.Fric = 2;
        this.XSize = 20;
        this.YSize = 20;
        this.X = 0;
        this.Y = 0;
        this.R = 0;
        this.MX = 0;
        this.MY = 0;
        this.MR = 0;
        this.Id = 0;
        this.Speed = 3;
        this.Alive = true;
        this.X = x;
        this.Y = y;
    }
    Entity.prototype.Sign = function (sign) {
        if (sign > 0) {
            return 1;
        }
        if (sign < 0) {
            return -1;
        }
        return 0;
    };
    Entity.prototype.AtSpeed = function (to, from, speed) {
        if (Math.abs(to - from) < speed) {
            speed = Math.abs(to - from);
        }
        return this.Sign(to - from) * speed;
    };
    Entity.prototype.Update = function (world) {
        this.UpdateColl(world);
        this.UpdateMove(world);
    };
    Entity.prototype.UpdateMove = function (world) {
        if (this.X + this.MX + (this.XSize / 2) > world.SizeX || this.X + this.MX - (this.XSize / 2) < 0) {
            this.MX = 0;
        }
        if (this.Y + this.MY + (this.YSize / 2) > world.SizeY || this.Y + this.MY - (this.YSize / 2) < 0) {
            this.MY = 0;
        }
        this.X += this.MX;
        this.Y += this.MY;
        this.R += this.MR;
        this.MX /= this.Fric;
        this.MY /= this.Fric;
        this.MR /= this.Fric;
        if (this.R < 0) {
            this.R += 360;
        }
        if (this.R > 360) {
            this.R -= 360;
        }
    };
    Entity.prototype.UpdateColl = function (world) {
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
                            if (!(this instanceof EntitySpawner)) {
                                this.Alive = false;
                                world.Dif += 0.02;
                            }
                            if (!(world.EntityList[i] instanceof EntitySpawner)) {
                                world.EntityList[i].Alive = false;
                                world.Dif += 0.02;
                            }
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
    };
    return Entity;
})();
var EntityMelee = (function (_super) {
    __extends(EntityMelee, _super);
    function EntityMelee(x, y) {
        _super.call(this, x, y);
        this.Speed = 2;

        this.Colour = "#00AA00";
    }
    EntityMelee.prototype.Update = function (world) {
        var angletolook = Math.atan2(world.EntityList[world.PlayerId].Y - this.Y, world.EntityList[world.PlayerId].X - this.X);
        angletolook = angletolook * (180 / Math.PI);
        if (this.Sign(angletolook) == -1) {
            angletolook -= 360;
        }
        this.R = angletolook;
        this.MX = this.Speed * Math.cos(this.R * (Math.PI / 180));
        this.MY = this.Speed * Math.sin(this.R * (Math.PI / 180));
        _super.prototype.Update.call(this, world);
    };
    return EntityMelee;
})(Entity);
var EntityPlayer = (function (_super) {
    __extends(EntityPlayer, _super);
    function EntityPlayer(x, y) {
        _super.call(this, x, y);
        this.Fire = false;
        this.CanFire = true;
        this.Forward = false;
        this.Backward = false;
        this.Left = false;
        this.Right = false;
        this.LL = false;
        this.LR = false;
        this.Id = 10;
        this.Colour = "#0000FF";
    }
    EntityPlayer.prototype.Update = function (world) {
        _super.prototype.Update.call(this, world);
        if (this.LR) {
            this.R += 12;
        }
        if (this.LL) {
            this.R -= 12;
        }
        if (this.Forward) {
            this.MoveForward();
        }
        if (this.Backward) {
            this.MoveBackward();
        }
        if (this.Left) {
            this.MoveLeft();
        }
        if (this.Right) {
            this.MoveRight();
        }
        if (this.Fire == true) {
            if (this.CanFire == true) {
                world.Add(new EntityBullet(this.X, this.Y, this.R));
                this.CanFire = false;
            }
            this.Fire = false;
        }
    };
    EntityPlayer.prototype.MoveForward = function () {
        this.MX = this.Speed * Math.cos((this.R + 0) * (Math.PI / 180));
        this.MY = this.Speed * Math.sin((this.R + 0) * (Math.PI / 180));
    };
    EntityPlayer.prototype.MoveBackward = function () {
        this.MX = this.Speed * Math.cos((this.R + 180) * (Math.PI / 180));
        this.MY = this.Speed * Math.sin((this.R + 180) * (Math.PI / 180));
    };
    EntityPlayer.prototype.MoveLeft = function () {
        this.MX = this.Speed * Math.cos((this.R + 90) * (Math.PI / 180));
        this.MY = this.Speed * Math.sin((this.R + 90) * (Math.PI / 180));
    };
    EntityPlayer.prototype.MoveRight = function () {
        this.MX = this.Speed * Math.cos((this.R - 90) * (Math.PI / 180));
        this.MY = this.Speed * Math.sin((this.R - 90) * (Math.PI / 180));
    };
    return EntityPlayer;
})(Entity);
var EntityBullet = (function (_super) {
    __extends(EntityBullet, _super);
    function EntityBullet(x, y, r) {
        _super.call(this, x, y);
        this.R = r;
        this.Fric = 1;
        this.Speed = 6;
        this.X += 24 * Math.cos(this.R * (Math.PI / 180));
        this.Y += 24 * Math.sin(this.R * (Math.PI / 180));
        this.MX = this.Speed * Math.cos(this.R * (Math.PI / 180));
        this.MY = this.Speed * Math.sin(this.R * (Math.PI / 180));
        this.Colour = "#000000";
        this.XSize = 6;
        this.YSize = 6;
    }
    EntityBullet.prototype.Update = function (world) {
        this.UpdateColl(world);
        if (this.X + this.MX + (this.XSize / 2) > world.SizeX || this.X + this.MX - (this.XSize / 2) < 0) {
            this.Alive = false;
        }
        if (this.Y + this.MY + (this.YSize / 2) > world.SizeY || this.Y + this.MY - (this.YSize / 2) < 0) {
            this.Alive = false;
        }
        _super.prototype.UpdateMove.call(this, world);
    };
    return EntityBullet;
})(Entity);
var EntitySpawner = (function (_super) {
    __extends(EntitySpawner, _super);
    function EntitySpawner(x, y) {
        _super.call(this, x, y);
        this.SpawnTimer = 0;
        this.SpawnMaxTimer = 0;
        this.SpawnMaxTimer = 40 + (Math.random() * 50);
        this.Colour = "#FFFF00";
    }
    EntitySpawner.prototype.Update = function (world) {
        _super.prototype.Update.call(this, world);
        if (this.SpawnTimer >= this.SpawnMaxTimer) {
            var i = world.Add(new EntityMelee(this.X, this.Y + 20));
            if (i != -1) {
                //world.EntityList[i].Speed *= world.Dif;
            }
            this.SpawnTimer = 0;
        } else {
            ++this.SpawnTimer;
        }
    };
    return EntitySpawner;
})(Entity);
var world = new World();
for (var i = 0; i < 10; ++i) {
    var raX = Math.random() * world.SizeX;
    while (Math.abs(raX - world.SizeX / 2) < 100 && raX > 10 && raX < world.SizeX - 10) {
        raX = Math.random() * world.SizeX;
    }
    var raY = Math.random() * world.SizeY;
    ;
    while (Math.abs(raY - world.SizeY / 2) < 100 && raY > 10 && raY < world.SizeY - 10) {
        raY = Math.random() * world.SizeY;
    }
    world.Add(new EntitySpawner(raX, raY));
}
world.Add(new EntityPlayer(world.SizeX / 2, world.SizeY / 2));
Canvas.width = world.SizeX;
Canvas.height = world.SizeY;
function Main() {
    if (Run == true) {
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
                    ctx.drawImage(zombie, -(world.EntityList[i].XSize / 2), -(world.EntityList[i].YSize / 2), world.EntityList[i].XSize, world.EntityList[i].YSize);
                } else if (world.EntityList[i] instanceof EntityPlayer) {
                    ctx.drawImage(player, -(world.EntityList[i].XSize / 2), -(world.EntityList[i].YSize / 2), world.EntityList[i].XSize, world.EntityList[i].YSize);
                } else {
                    ctx.fillRect(-(world.EntityList[i].XSize / 2), -(world.EntityList[i].YSize / 2), world.EntityList[i].XSize, world.EntityList[i].YSize);
                }
                ctx.restore();
            }
        }
    }
}

//
function HandleKeyDown(e) {
    var key = e.keyCode || e.which;
    if (key == 87) {
        (world.EntityList[world.PlayerId]).Forward = true;
    }
    if (key == 83) {
        (world.EntityList[world.PlayerId]).Backward = true;
    }
    if (key == 65) {
        (world.EntityList[world.PlayerId]).LL = true;
    }
    if (key == 68) {
        (world.EntityList[world.PlayerId]).LR = true;
    }
    if (key == 32) {
        (world.EntityList[world.PlayerId]).Fire = true;
    }
}
function HandleKeyUp(e) {
    var key = e.keyCode || e.which;
    if (key == 87) {
        (world.EntityList[world.PlayerId]).Forward = false;
    }
    if (key == 83) {
        (world.EntityList[world.PlayerId]).Backward = false;
    }
    if (key == 65) {
        (world.EntityList[world.PlayerId]).LL = false;
    }
    if (key == 68) {
        (world.EntityList[world.PlayerId]).LR = false;
    }
    if (key == 32) {
        (world.EntityList[world.PlayerId]).CanFire = true;
    }
}

document.addEventListener("keydown", HandleKeyDown);
document.addEventListener("keyup", HandleKeyUp);
setInterval(Main, 50);
