///<reference path="WebGL.d.ts"/>
///<reference path="Pipe.ts"/>
var WebGLGame;
(function (_WebGLGame) {
    var WebGLGame = (function () {
        function WebGLGame(wrld) {
            this.GridVertexBufferSize = 0;
            this.GridVertexBuffer = null;
            this.GridColourBufferSize = 0;
            this.GridColourBuffer = null;
            this.GridIndexBufferSize = 0;
            this.GridIndexBuffer = null;
            this.ShaderType = 0;
            this.world = wrld;
        }
        WebGLGame.prototype.InitGL = function () {
            this.InitRenderCanvas();

            //Shaders e.g.
            //this.InitShaderSmooth();
            //this.InitShaderContoured();
            this.InitShaderStaggerd();
            this.GL.clearColor(0.0, 0.0, 0.0, 1.0);
            this.GL.enable(this.GL.DEPTH_TEST);
            this.ResetGL();
        };
        WebGLGame.prototype.InitRenderCanvas = function () {
            try  {
                this.GL = this.world.RenderCanvas.getContext("webgl") || this.world.RenderCanvas.getContext("experimental-webgl");
                this.GL.viewport(0, 0, this.world.RenderCanvas.width, this.world.RenderCanvas.height);
            } catch (e) {
                console.log(e);
            }
            if (!this.GL) {
                console.log("Could not initialise WebGL");
                this.world.CanRenderWebGL = false;
                this.world.WillRenderWebGL = false;
            }
        };
        WebGLGame.prototype.RenderWorld = function () {
        };
        WebGLGame.prototype.ResetGL = function () {
            //Buffers e.g.
            this.InitBuffers();
        };
        WebGLGame.prototype.GetShader = function (gl, id) {
            var shaderScript = document.getElementById(id);
            if (!shaderScript) {
                return null;
            }
            var str = "";
            var k = shaderScript.firstChild;
            while (k) {
                if (k.nodeType == 3) {
                    str += k.textContent;
                }
                k = k.nextSibling;
            }
            var shader;
            if (shaderScript.type == "x-shader/x-fragment") {
                shader = gl.createShader(gl.FRAGMENT_SHADER);
            } else if (shaderScript.type == "x-shader/x-vertex") {
                shader = gl.createShader(gl.VERTEX_SHADER);
            } else {
                return null;
            }
            console.log("Compiling Shader " + shaderScript.type);
            gl.shaderSource(shader, str);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.log(gl.getShaderInfoLog(shader));
                return null;
            }
            return shader;
        };

        WebGLGame.prototype.InitShaderSmooth = function () {
            this.ShaderType = 0;
            var fragmentShader = this.GetShader(this.GL, "FragmentShader");
            var vertexShader = this.GetShader(this.GL, "VertexShader");
            this.ShaderProgram = this.GL.createProgram();
            this.GL.attachShader(this.ShaderProgram, vertexShader);
            this.GL.attachShader(this.ShaderProgram, fragmentShader);
            this.GL.linkProgram(this.ShaderProgram);
            if (!this.GL.getProgramParameter(this.ShaderProgram, this.GL.LINK_STATUS)) {
                console.log("Could not initialise shaders");
            }
            this.GL.useProgram(this.ShaderProgram);
            this.VertexPos = this.GL.getAttribLocation(this.ShaderProgram, "VertexPosition");
            this.GL.enableVertexAttribArray(this.VertexPos);
            this.ColourPos = this.GL.getAttribLocation(this.ShaderProgram, "VertexColour");
            this.GL.enableVertexAttribArray(this.ColourPos);
        };
        WebGLGame.prototype.InitShaderContoured = function () {
            this.ShaderType = 1;
            var fragmentShader = this.GetShader(this.GL, "ContoursFragShader");
            var vertexShader = this.GetShader(this.GL, "ContoursVertShader");
            this.ShaderProgram = this.GL.createProgram();
            this.GL.attachShader(this.ShaderProgram, vertexShader);
            this.GL.attachShader(this.ShaderProgram, fragmentShader);
            this.GL.linkProgram(this.ShaderProgram);
            if (!this.GL.getProgramParameter(this.ShaderProgram, this.GL.LINK_STATUS)) {
                console.log("Could not initialise shaders");
            }
            this.GL.useProgram(this.ShaderProgram);
            this.VertexPos = this.GL.getAttribLocation(this.ShaderProgram, "VertexPosition");
            this.GL.enableVertexAttribArray(this.VertexPos);
            this.ColourPos = this.GL.getAttribLocation(this.ShaderProgram, "VertexColour");
            this.GL.enableVertexAttribArray(this.ColourPos);
        };
        WebGLGame.prototype.handleTextureLoaded = function (image, texture) {
            this.GL.bindTexture(this.GL.TEXTURE_2D, texture);
            this.GL.texImage2D(this.GL.TEXTURE_2D, 0, this.GL.RGBA, this.GL.RGBA, this.GL.UNSIGNED_BYTE, image);
            this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_MAG_FILTER, this.GL.LINEAR);
            this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_MIN_FILTER, this.GL.LINEAR_MIPMAP_NEAREST);
            this.GL.generateMipmap(this.GL.TEXTURE_2D);
            this.GL.bindTexture(this.GL.TEXTURE_2D, null);
        };
        WebGLGame.prototype.InitShaderStaggerd = function () {
            this.ShaderType = 2;
            var fragmentShader = this.GetShader(this.GL, "StaggerdFragShader");
            var vertexShader = this.GetShader(this.GL, "StaggerdVertShader");
            this.ShaderProgram = this.GL.createProgram();
            this.GL.attachShader(this.ShaderProgram, vertexShader);
            this.GL.attachShader(this.ShaderProgram, fragmentShader);
            this.GL.linkProgram(this.ShaderProgram);
            if (!this.GL.getProgramParameter(this.ShaderProgram, this.GL.LINK_STATUS)) {
                console.log("Could not initialise shaders");
            }
            this.GL.useProgram(this.ShaderProgram);
            this.VertexPos = this.GL.getAttribLocation(this.ShaderProgram, "VertexPosition");
            this.GL.enableVertexAttribArray(this.VertexPos);

            //this.TexturePos = this.GL.getAttribLocation(this.ShaderProgram, "VertexColour");
            //this.GL.enableVertexAttribArray(this.TexturePos);
            var Size = this.world.WorldSize;

            //alert(Size);
            //this.GL.enable(this.GL.TEXTURE_2D);
            this.TextureDataWidth = Size;
            this.TextureDataHeight = Size;
            this.TextureData = new Uint8Array(this.TextureDataWidth * this.TextureDataHeight * 4);
            this.ColourTexture = this.GL.createTexture();
            for (var i = 0; i < Size * Size; ++i) {
                var id = i * 4;
                this.TextureData[id] = 255;
                this.TextureData[id + 1] = 0;
                this.TextureData[id + 2] = 0;
                this.TextureData[id + 3] = 255;
            }
            this.GL.bindTexture(this.GL.TEXTURE_2D, this.ColourTexture);
            this.GL.texImage2D(this.GL.TEXTURE_2D, 0, this.GL.RGBA, this.TextureDataWidth, this.TextureDataHeight, 0, this.GL.RGBA, this.GL.UNSIGNED_BYTE, this.TextureData);

            ///this.GL.texParameteri(this.GL.TEXTURE_2D,this.GL.TEXTURE_WRAP_S,this.GL.CLAMP_TO_EDGE ); //this.GL.TEXTURE_MAG_FILTER, this.GL.LINEAR);
            ///this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_WRAP_T, this.GL.CLAMP_TO_EDGE );// this.GL.LINEAR_MIPMAP_NEAREST);
            ///this.GL.generateMipmap(this.GL.TEXTURE_2D);
            this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_MAG_FILTER, this.GL.NEAREST);
            this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_MIN_FILTER, this.GL.NEAREST);
            this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_WRAP_S, this.GL.CLAMP_TO_EDGE);
            this.GL.texParameteri(this.GL.TEXTURE_2D, this.GL.TEXTURE_WRAP_T, this.GL.CLAMP_TO_EDGE);
            //this.GL.bindTexture(this.GL.TEXTURE_2D, null);
            //this.ColourTexture = this.GL.createTexture();
            //var cubeImage = new Image();
            //cubeImage.onload = function () { world.handleTextureLoaded(cubeImage, world.ColourTexture); }
            //cubeImage.src = "thing.png";
        };
        WebGLGame.prototype.InitBuffers = function () {
            var Vertices = [];
            var Colours = [];
            var Indicies = [];
            if (this.GridVertexBuffer != null) {
                this.GL.deleteBuffer(this.GridVertexBuffer);
            }

            this.GridVertexBuffer = this.GL.createBuffer();
            this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.GridVertexBuffer);
            var HSize = (this.world.WorldSize - 1) / 2;
            for (var x = 0; x < this.world.WorldSize; ++x) {
                for (var y = 0; y < this.world.WorldSize; ++y) {
                    Vertices.push((x / HSize) - 1, 1 - (y / HSize));
                }
            }
            this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(Vertices), this.GL.STATIC_DRAW);
            this.GridVertexBufferSize = Vertices.length;
            if (this.ShaderType != 2) {
                if (this.GridColourBuffer != null) {
                    this.GL.deleteBuffer(this.GridColourBuffer);
                }
                this.GridColourBuffer = this.GL.createBuffer();
                this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.GridColourBuffer);
                for (var x = 0; x < this.world.WorldSize; ++x) {
                    for (var y = 0; y < this.world.WorldSize; ++y) {
                        Colours.push(0, 0, 1, 0);
                    }
                    this.ColourArray = new Float32Array(Colours);
                    this.GL.bufferData(this.GL.ARRAY_BUFFER, this.ColourArray, this.GL.STREAM_DRAW);
                    this.GridColourBufferSize = Colours.length;
                }
            }
            if (this.GridIndexBuffer != null) {
                this.GL.deleteBuffer(this.GridIndexBuffer);
            }
            this.GridIndexBuffer = this.GL.createBuffer();
            this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.GridIndexBuffer);
            for (var x = 0; x < this.world.WorldSize - 1; ++x) {
                for (var y = 0; y < this.world.WorldSize - 1; ++y) {
                    var pos = x + (y * this.world.WorldSize);
                    Indicies.push(pos, pos + 1, pos + 1 + this.world.WorldSize);
                    Indicies.push(pos, pos + this.world.WorldSize, pos + 1 + this.world.WorldSize);
                }
            }
            this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(Indicies), this.GL.STATIC_DRAW);
            this.GridIndexBufferSize = Indicies.length;
        };
        WebGLGame.prototype.RenderWebGL = function () {
            //Update Colour
            var Size = 4;
            this.GL.bindTexture(this.GL.TEXTURE_2D, this.ColourTexture);

            for (var x = 0; x < this.world.WorldSize; ++x) {
                for (var y = 0; y < this.world.WorldSize; ++y) {
                    var id = (y + (x * this.world.WorldSize)) * Size;
                    if (this.ShaderType == 2) {
                        id = (x + (y * this.world.WorldSize)) * Size;
                    }
                    var BrightnessDec = Math.min(1, Math.max(0.1, (this.world.GroundHeight.GetValueAt(x, y) + this.world.RockHeight.GetValueAt(x, y)) / (this.world.GroundHeight.MaxHeight + this.world.RockHeight.MaxHeight)));
                    var R = BrightnessDec;
                    var G = BrightnessDec;
                    var B = BrightnessDec;
                    if (this.world.GroundHeight.GetValueAt(x, y) > 0.1) {
                        R *= 1; //255
                        G *= 0.78; //200
                        B *= 0.47; //129
                    } else {
                        R *= 0.5; //123/255
                        G *= 0.5; //123/255
                        B *= 0.5; //123/255
                    }
                    if (this.world.WaterHeight.GetValueAt(x, y) > 0) {
                        //00D4FF Water
                        var BrightnessDecWater = 1 - (this.world.WaterHeight.GetValueAt(x, y) / (0.5 * this.world.WaterHeight.MaxHeight));

                        //BrightnessDecWater = Math.max(0, Math.min(1, BrightnessDecWater))
                        R /= 2; //R = 0
                        G += 0.83 * BrightnessDecWater; //212/255
                        G /= Math.max(2, Math.ceil(G));
                        B += 1; //255
                        B /= Math.max(2, Math.ceil(B));
                    }
                    if (R > 1) {
                        R = 1;
                    }
                    if (G > 1) {
                        G = 1;
                    }
                    if (B > 1) {
                        B = 1;
                    }
                    if (this.ShaderType == 2) {
                        if (this.world.GroundType.GetValueAt(x, y) == 1) {
                            R = 0;
                            G = 1;
                            B = 0;
                        }
                        if (this.world.GroundType.GetValueAt(x, y) == 2) {
                            R = 1;
                            G = 0;
                            B = 0;
                        }
                        if (this.world.GroundType.GetValueAt(x, y) == 3) {
                            R = 1;
                            G = 0;
                            B = 1;
                        }
                        this.TextureData[id] = R * 255;
                        this.TextureData[id + 1] = G * 255;
                        this.TextureData[id + 2] = B * 255;
                        this.TextureData[id + 3] = 255;
                        ////this.TextureData[id + 3] = this.GroundType.GetValueAt(x, y);
                    } else {
                        this.ColourArray[id] = R;
                        this.ColourArray[id + 1] = G;
                        this.ColourArray[id + 2] = B;
                        this.ColourArray[id + 3] = this.world.GroundType.GetValueAt(x, y);
                    }
                }
            }
            if (this.ShaderType == 2) {
                this.GL.texImage2D(this.GL.TEXTURE_2D, 0, this.GL.RGBA, this.TextureDataWidth, this.TextureDataHeight, 0, this.GL.RGBA, this.GL.UNSIGNED_BYTE, this.TextureData);
            } else {
                this.GL.bufferData(this.GL.ARRAY_BUFFER, this.ColourArray, this.GL.STREAM_DRAW);
            }

            //Render
            this.GL.clear(this.GL.COLOR_BUFFER_BIT | this.GL.DEPTH_BUFFER_BIT);
            this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.GridVertexBuffer);
            this.GL.vertexAttribPointer(this.VertexPos, 2, this.GL.FLOAT, false, 0, 0);
            if (this.ShaderType != 2) {
                this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.GridColourBuffer);
                this.GL.vertexAttribPointer(this.ColourPos, 4, this.GL.FLOAT, false, 0, 0);
            }
            if (this.ShaderType == 2) {
                this.GL.activeTexture(this.GL.TEXTURE0);
                this.GL.bindTexture(this.GL.TEXTURE_2D, this.ColourTexture);
                this.GL.uniform1i(this.GL.getUniformLocation(this.ShaderProgram, "uSampler"), 0);
            }
            this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.GridIndexBuffer);
            this.GL.drawElements(this.GL.TRIANGLES, this.GridIndexBufferSize, this.GL.UNSIGNED_SHORT, 0);
            //this.GL.drawArrays(this.GL.TRIANGLE_STRIP, 0, 3);
        };
        return WebGLGame;
    })();
    _WebGLGame.WebGLGame = WebGLGame;
})(WebGLGame || (WebGLGame = {}));
//# sourceMappingURL=WebGLGame.js.map
