use crate::constants::WORLD_SIZE;

#[derive(PartialEq, Clone, Copy)]
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

        let left = self.x - self.r;
        let right = self.x + self.r;
        let top = self.y - self.r;
        let bottom = self.y + self.r;

        if left < 0.0 {
            self.x -= left * 2.0;
            self.vx *= -1.0;
        }

        if right > WORLD_SIZE {
            let rem = right - WORLD_SIZE;

            self.x -= rem * 2.0;
            self.vx *= -1.0;
        }

        if top < 0.0 {
            self.y -= top * 2.0;
            self.vy *= -1.0;
        }

        if bottom > WORLD_SIZE {
            let rem = bottom - WORLD_SIZE;

            self.y -= rem * 2.0;
            self.vy *= -1.0;
        }
    }
}
