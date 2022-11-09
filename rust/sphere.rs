use std::cell::Cell;

use crate::constants::{
    MAX_SPHERE_R, MAX_SPHERE_SPEED, R_DECREASE_RATIO, SHOOT_AREA_RATIO, SHOOT_DELAY, SHOOT_FORCE,
    WORLD_SIZE,
};

#[repr(u8)]
#[derive(PartialEq, Clone, Copy)]
pub enum SphereType {
    PLAYER {
        name: usize,
        shoot_delay: f64,
        is_fake: bool,
        rank: usize,
    },
    FOOD,
    AM,
    BULLET {
        shooter_id: usize,
        is_in_shooter: bool,
    },
}

#[derive(PartialEq, Clone, Copy)]
pub struct Sphere {
    pub x: f64,
    pub y: f64,
    pub vx: f64,
    pub vy: f64,
    pub r: f64,
    pub color: u32,
    pub r#type: SphereType,

    // unique id, for now we use usize.
    // I want to use u64, but JS does not support u64, and usize should be sufficient enough
    pub uid: usize,
}

impl Sphere {
    pub fn new(x: f64, y: f64, vx: f64, vy: f64, r: f64, color: u32, r#type: SphereType) -> Sphere {
        Sphere {
            x,
            y,
            vx,
            vy,
            r,
            color,
            r#type,
            uid: 0,
        }
    }

    pub fn zero() -> Sphere {
        Sphere {
            x: 0.0,
            y: 0.0,
            vx: 0.0,
            vy: 0.0,
            r: 0.0,
            color: 0,
            r#type: SphereType::FOOD,
            uid: 0,
        }
    }

    pub fn set(
        &mut self,
        x: f64,
        y: f64,
        vx: f64,
        vy: f64,
        r: f64,
        color: u32,
        r#type: SphereType,
        uid: usize,
    ) {
        self.x = x;
        self.y = y;
        self.vx = vx;
        self.vy = vy;
        self.r = r;
        self.color = color;
        self.r#type = r#type;
        self.uid = uid;
        self.reset_shoot_delay();
    }

    pub fn set_shooter(&mut self, shooter_id: usize) {
        match self.r#type {
            SphereType::BULLET {
                shooter_id: _,
                is_in_shooter: _,
            } => {
                self.r#type = SphereType::BULLET {
                    shooter_id,
                    is_in_shooter: true,
                };
            }
            _ => {}
        }
    }

    pub fn reset_shoot_delay(&mut self) {
        match self.r#type {
            SphereType::PLAYER {
                name,
                shoot_delay: _,
                is_fake,
                rank,
            } => {
                self.r#type = SphereType::PLAYER {
                    name,
                    shoot_delay: SHOOT_DELAY,
                    is_fake,
                    rank,
                }
            }
            _ => {}
        }
    }

    pub fn update(&mut self, dt: f64) {
        match self.r#type {
            SphereType::PLAYER {
                name,
                shoot_delay,
                is_fake,
                rank,
            } => {
                self.r#type = SphereType::PLAYER {
                    name,
                    shoot_delay: f64::max(shoot_delay - dt, 0.0),
                    is_fake,
                    rank,
                }
            }
            _ => {}
        }

        self.r -= R_DECREASE_RATIO * self.r * dt;

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

    pub fn shoot(&mut self, dirx: f64, diry: f64) {
        self.vx -= dirx * SHOOT_FORCE;
        self.vy -= diry * SHOOT_FORCE;

        let speed_sq = self.vx * self.vx + self.vy * self.vy;

        if speed_sq > MAX_SPHERE_SPEED * MAX_SPHERE_SPEED {
            let speed = f64::sqrt(speed_sq);
            self.vx = (self.vx / speed) * MAX_SPHERE_SPEED;
            self.vy = (self.vy / speed) * MAX_SPHERE_SPEED;
        }

        self.r *= SHOOT_AREA_RATIO;
    }

    pub fn absorb(s1: &Sphere, s2: &Sphere, eater: &Sphere, distance_sq: f64) -> (f64, f64) {
        let r_sq_total = s1.r * s1.r + s2.r * s2.r;
        let eater_r: f64;
        let eaten_r: f64;

        if distance_sq <= r_sq_total {
            eater_r = f64::min(f64::sqrt(r_sq_total), MAX_SPHERE_R);
            eaten_r = 0.0;
        } else {
            let distance = f64::sqrt(distance_sq);

            let r1 = distance * 0.5 + f64::sqrt(0.5 * (r_sq_total) - distance_sq * 0.25);

            eater_r = f64::min(r1, MAX_SPHERE_R);
            eaten_r = distance - eater_r;
        }

        if eater == s1 {
            return (eater_r, eaten_r);
        } else {
            return (eaten_r, eater_r);
        }
    }

    pub fn melt(s1: &Sphere, s2: &Sphere, bigger: &Sphere, distance_sq: f64) -> (f64, f64) {
        let r1_sq = s1.r * s1.r;
        let r2_sq = s2.r * s2.r;
        let r_sq_total = r1_sq + r2_sq;
        let r_sq_diff = f64::abs(r1_sq - r2_sq);
        let bigger_r: f64;
        let smaller_r: f64;

        if distance_sq <= r_sq_total {
            bigger_r = f64::sqrt(r_sq_diff);
            smaller_r = 0.0;
        } else {
            let distance = f64::sqrt(distance_sq);

            bigger_r = (r_sq_diff + distance_sq) / (2.0 * distance);
            smaller_r = distance - bigger_r;
        }

        if bigger == s1 {
            return (bigger_r, smaller_r);
        } else {
            return (smaller_r, bigger_r);
        }
    }
}
