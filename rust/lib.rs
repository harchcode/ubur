extern crate wee_alloc;

pub mod constants;
pub mod pool;
pub mod quad_tree;
pub mod sphere;
pub mod utils;
pub mod world;

use crate::constants::WORLD_SIZE;
use crate::utils::log;
use wasm_bindgen::prelude::*;
use world::World;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct RegisterPlayerResponse(pub usize, pub usize);

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

    pub fn register_player(&mut self, name: String) -> RegisterPlayerResponse {
        let (id, uid) = self.world.spawn_player(name);
        // let r = [id, uid];

        // log(&format!("{:?}", r));

        return RegisterPlayerResponse(id, uid);
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

    pub fn get_sphere_score(&self, id: usize) -> usize {
        let r = self.world.spheres.get(id).r;

        // return area, but instead of using std::f64::consts::PI i used 4.0
        // so the max radius of 250 will have max score of 250000
        f64::trunc(4.0 * r * r) as usize
    }

    pub fn get_sphere_color(&self, id: usize) -> u32 {
        self.world.spheres.get(id).color
    }

    pub fn get_sphere_name(&self, id: usize) -> Option<usize> {
        match self.world.name_map.get(&id) {
            Some(x) => Some(*x),
            None => None,
        }
    }

    pub fn get_sphere_ids(&mut self) -> *const usize {
        self.world.spheres.update();

        let mut r = self.world.spheres.alive_ids.clone();
        r.insert(0, r.len());

        return r.as_ptr();
    }

    pub fn get_visible_sphere_ids(
        &mut self,
        aspect_ratio: f64,
        x: f64,
        y: f64,
        view_area: f64,
    ) -> *const usize {
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

    pub fn get_sphere_view_area(&self, id: usize) -> f64 {
        self.world.spheres.get(id).r * 2500.0 + 25000.0
    }

    pub fn get_visible_sphere_ids_of_sphere(
        &mut self,
        id: usize,
        aspect_ratio: f64,
    ) -> *const usize {
        let s = self.world.spheres.get(id);
        let (x, y) = (s.x, s.y);
        let view_area = self.get_sphere_view_area(id);

        return self.get_visible_sphere_ids(aspect_ratio, x, y, view_area);
    }

    pub fn shoot(&mut self, id: usize, x: f64, y: f64) {
        self.world.shoot(id, x, y);
    }

    pub fn is_player_dead(&mut self, id: usize, uid: usize) -> bool {
        let s = self.world.spheres.get(id);

        return s.r <= 0.0 || s.uid != uid;
    }

    pub fn get_top_5_player_ids(&mut self) -> *const usize {
        let mut r = Vec::with_capacity(5);
        let len = usize::min(self.world.highscore_player_ids.len(), 5);

        r.push(len);

        for i in 0..len {
            r.push(self.world.highscore_player_ids[i]);
        }

        return r.as_ptr();
    }

    pub fn get_sphere_rank(&mut self, id: usize) -> usize {
        return *self.world.player_ranking_map.get(&id).unwrap_or(&0);
    }
}
