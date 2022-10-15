pub struct Sphere {
    pub x: f64,
    pub y: f64,
    pub vx: f64,
    pub vy: f64,
    pub r: f64,
    pub color: u32,
}

impl Sphere {
    pub fn new(x: f64, y: f64, vx: f64, vy: f64, r: f64, color: u32) -> Sphere {
        Sphere {
            x,
            y,
            vx,
            vy,
            r,
            color,
        }
    }

    pub fn update(&mut self, dt: f64) {
        self.x += self.vx * dt;
        self.y += self.vy * dt;
    }
}
