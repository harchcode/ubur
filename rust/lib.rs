pub mod sphere;
pub mod utils;

use crate::sphere::Sphere;
use crate::utils::{log, rand_int};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Ubur {
    spheres: Vec<Sphere>,
}

#[wasm_bindgen]
impl Ubur {
    pub fn new() -> Ubur {
        Ubur { spheres: vec![] }
    }

    pub fn init(&mut self) {
        for _ in 0..10 {
            self.spheres.push(Sphere::new(
                0.0,
                0.0,
                rand_int(0, 100) as f64,
                rand_int(0, 100) as f64,
                rand_int(20, 100) as f64,
                rand_int(0x666666, 0xffffff) as u32,
            ))
        }
    }

    pub fn update(&mut self, dt: f64) {
        for sphere in self.spheres.iter_mut() {
            sphere.update(dt);
        }
    }

    pub fn get_sphere_count(&self) -> usize {
        self.spheres.len()
    }

    pub fn get_sphere_x(&self, index: usize) -> f64 {
        self.spheres[index].x
    }

    pub fn get_sphere_y(&self, index: usize) -> f64 {
        self.spheres[index].y
    }

    pub fn get_sphere_r(&self, index: usize) -> f64 {
        self.spheres[index].r
    }

    pub fn get_sphere_color(&self, index: usize) -> u32 {
        self.spheres[index].color
    }
}
