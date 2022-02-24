class RAYCAST {
    _rect = class RAYCASTRECT {
        _nearer_collision = {};

        constructor(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width  = width;
            this.height = height;

            this.dots = this.dotsByRect();
        }

        dotsByRect() {
            let dots = [
                {'x': this.x,              'y': this.y},
                {'x': this.x,              'y': this.y + this.height},
                {'x': this.x + this.width, 'y': this.y},
                {'x': this.x + this.width, 'y': this.y + this.height}
            ];
            return dots;
        }

        getNearerWallsCollision(x1, y1, angle) {
            let nw = `${x1}|${y1}|${angle}`;
            if(nw in this._nearer_collision)
                return this._nearer_collision[nw];

            let walls = {
                'top'   : this.y,
                'bottom': this.y + this.height,
                'left'  : this.x,
                'right' : this.x + this.width
            };
            let dir = [];
            
            let ycol = null;
            if(angle >= 0 && angle <= 180) {
                if(walls.top <= y1) {
                    ycol = y1 - walls.top;
                    dir[0] = 'top';
                }
                if(walls.bottom <= y1) {
                    ycol = y1 - walls.bottom;
                    dir[0] = 'bottom';
                }
            }
            else {
                if(walls.bottom > y1) {
                    ycol = walls.bottom - y1;
                    dir[0] = 'bottom';
                }
                if(walls.top > y1) {
                    ycol = walls.top - y1;
                    dir[0] = 'top';
                }
            }
            if(ycol === null) {
                this._nearer_collision[nw] = null;
                return null;
            }
            
            let xcol = null;
            if(angle >= 90 && angle <= 270) {
                if(walls.right >= x1) {
                    xcol = walls.right - x1;
                    dir[1] = 'right';
                }
                if(walls.left >= x1) {
                    xcol = walls.left - x1;
                    dir[1] = 'left';
                }
            }
            else {
                if(walls.left < x1) {
                    xcol = x1 - walls.left;
                    dir[1] = 'left';
                }
                if(walls.right < x1) {
                    xcol = x1 - walls.right;
                    dir[1] = 'right';
                }
            }
            if(xcol === null) {
                this._nearer_collision[nw] = null;
                return null;
            }

            let d_error = 0.5;
            let r_lines = [null, null];

            let yline = Math.abs(Math.round(xcol * (Math.tan(angle * (Math.PI / 180)))));
            yline = angle >= 0 && angle <= 180? y1 - yline: yline + y1;
            if(yline >= walls.top-d_error && yline <= walls.bottom+d_error) {
                r_lines[0] = [walls[dir[1]], yline];
            }

            let xline = Math.abs(Math.round(ycol / (Math.tan(angle * (Math.PI / 180)))));
            xline = angle >= 90 && angle <= 270? xline + x1: x1 - xline;
            if(xline >= walls.left-d_error && xline <= walls.right+d_error) {
                r_lines[1] = [xline, walls[dir[0]]];
            }

            if(r_lines[0] !== null || r_lines[1] !== null) {
                // only one axis is valid
                if(r_lines.includes(null)) {
                    this._nearer_collision[nw] = r_lines[0]?? r_lines[1];
                }
                else {
                    // both axis are valid
                    let line_size = (x, y) => Math.sqrt(((x - x1)**2) + ((y - y1)**2));
                    let sizes = [line_size(...r_lines[0]), line_size(...r_lines[1])];
                    this._nearer_collision[nw] = sizes[0] < sizes[1]? r_lines[0]: r_lines[1];
                }
            }
            else {
                this._nearer_collision[nw] = null;
            }

            return this._nearer_collision[nw];
        }
    };

    _internal = class INTERNALRAYCAST {
        static getAngle(x1, y1, x2, y2) {
            let ca = x1 - x2;
            let co = y1 - y2;
            let angle = Math.atan2(co, ca) * (180 / Math.PI);
            return angle < 0? 360 + angle: angle;
        }
    };

    _dot_list  = [];
    _rect_list = [];

    constructor (cv_width, cv_height) {
        this._canvas = new this._rect(0, 0, cv_width, cv_height);
        
        this.addDots(new this._rect(0, 0, cv_width, cv_height).dots);
    }

    addDots(dots) {
        this._dot_list = [...this._dot_list, ...dots];
        return this._dot_list;
    }

    addRect(x, y, width, height) {
        let new_rect = new this._rect(x, y, width, height);
        this._rect_list.push(new_rect);
        this.addDots(new_rect.dots);
    }

    getCasts(x, y) {
        let casts = this._dot_list.reduce((acc, d) => {
                let coll = this.castCollide(x, y, d.x, d.y);
                if (coll === null) return acc;
                return [...acc, ...coll];
            }, []).filter(c => c !== null);
        // console.log(casts);
        casts = casts.sort((a, b) => a[2] - b[2]).map(c => ({'x':c[0], 'y':c[1], 'angle':c[2]}));
        // console.log(casts);
        return casts;
    }

    castCollide(x1, y1, x2=null, y2=null, angle=null, ignore_list=[]) {
        if(angle === null)
            angle = this._internal.getAngle(x1, y1, x2, y2);
        
        // get raycast to canvas borders
        let cast = this._canvas.getNearerWallsCollision(x1, y1, angle);
        if(cast === null) return null;
        let casts = [[...cast, angle]];

        let cast_size = (x, y) => Math.sqrt(((x - x1)**2) + ((y - y1)**2));

        // adjust raycast collide with rect list
        let last_cast_size = Infinity;
        for(let r in this._rect_list) {
            
            let rcast = this._rect_list[r].getNearerWallsCollision(x1, y1, angle);
            if(rcast !== null) {
                if(ignore_list.includes(r)) return null;

                // add smaller cast
                let csize = cast_size(...rcast);
                if(last_cast_size > csize) {
                    last_cast_size = csize;
                    casts[0] = [...rcast, angle];
                }

                //dumb way to do three-casting
                let recast_error = 55/csize;
                let recasts = [null, null];
                recasts[0] = this.castCollide(x1, y1, null, null, angle - recast_error, [...ignore_list, r]);
                recasts[1] = this.castCollide(x1, y1, null, null, angle + recast_error, [...ignore_list, r]);
                casts = [...casts, ...recasts[0]??[null], ...recasts[1]??[null]];

            }
        }

        return casts;
    }
}