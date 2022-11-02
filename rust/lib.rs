pub mod constants;
pub mod pool;
pub mod sphere;
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
        return self.world.spawn_player();
    }

    pub fn get_sphere_x(&self, id: usize) -> f64 {
        self.world.spheres.get(id).x
    }

    pub fn get_sphere_y(&self, id: usize) -> f64 {
        self.world.spheres.get(id).y
    }

    pub fn get_sphere_r(&self, id: usize) -> f64 {
        self.world.spheres.get(id).r
    }

    pub fn get_sphere_color(&self, id: usize) -> u32 {
        self.world.spheres.get(id).color
    }

    pub fn get_sphere_ids(&mut self) -> *const usize {
        self.world.spheres.update();

        let mut r = self.world.spheres.alive_ids.clone();
        r.insert(0, r.len());

        return r.as_ptr();
    }

    pub fn get_sphere_view_area(&self, id: usize) -> f64 {
        self.world.spheres.get(id).r * 2000.0 + 200000.0
    }

    pub fn get_visible_sphere_ids(&mut self, id: usize, aspect_ratio: f64) -> *const usize {
        let s = self.world.spheres.get(id);
        let (x, y) = (s.x, s.y);
        let view_area = self.get_sphere_view_area(id);
        let h = f64::sqrt(view_area / aspect_ratio);
        let w = aspect_ratio * h;

        let left = x - w * 0.5;
        let right = x + w * 0.5;
        let top = y - h * 0.5;
        let bottom = y + h * 0.5;

        self.world.spheres.update();

        let mut r = vec![];

        for id in self.world.spheres.alive_ids.iter() {
            let sphere = self.world.spheres.get(*id);

            if sphere.x + sphere.r > left
                && sphere.x - sphere.r < right
                && sphere.y + sphere.r > top
                && sphere.y - sphere.r < bottom
            {
                r.push(*id);
            }
        }

        r.insert(0, r.len());

        return r.as_ptr();
    }

    pub fn shoot(&mut self, id: usize, x: f64, y: f64) {
        self.world.shoot(id, x, y);
    }
}
