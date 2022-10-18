pub mod command;
pub mod constants;
pub mod sphere;
pub mod sphere_pool;
pub mod utils;
pub mod world;

use crate::constants::WORLD_SIZE;
use crate::sphere::Sphere;
use crate::utils::{log, rand_int};
use wasm_bindgen::prelude::*;
use world::World;

#[wasm_bindgen]
pub struct Ubur {
    world: World,
}

#[wasm_bindgen]
impl Ubur {
    pub fn new() -> Ubur {
        Ubur {
            world: World::new(),
        }
    }

    pub fn world_size() -> f64 {
        WORLD_SIZE
    }

    pub fn init(&mut self) {
        self.world.init();
    }

    pub fn update(&mut self, dt: f64) {
        self.world.update(dt)
    }

    pub fn register_player(&mut self) -> usize {
        self.world.spawn_player();

        return self.world.spheres.len();
    }

    pub fn get_sphere_count(&self) -> usize {
        self.world.spheres.len()
    }

    pub fn get_sphere_x(&self, index: usize) -> f64 {
        self.world.spheres[index].x
    }

    pub fn get_sphere_y(&self, index: usize) -> f64 {
        self.world.spheres[index].y
    }

    pub fn get_sphere_r(&self, index: usize) -> f64 {
        self.world.spheres[index].r
    }

    pub fn get_sphere_color(&self, index: usize) -> u32 {
        self.world.spheres[index].color
    }
}
