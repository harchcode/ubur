use crate::{
    constants::MAX_SPHERE_R,
    sphere::Sphere,
    utils::{log, rand_int},
};

pub struct World {
    pub spheres: Vec<Sphere>,
}

impl World {
    pub fn new() -> World {
        World { spheres: vec![] }
    }

    pub fn init(&mut self) {
        for _ in 0..100 {
            self.spheres.push(Sphere::new(
                rand_int(100, 800) as f64,
                rand_int(100, 800) as f64,
                (rand_int(0, 100) as i32 - 50) as f64,
                (rand_int(0, 100) as i32 - 50) as f64,
                rand_int(10, 20) as f64,
                rand_int(0x666666, 0xffffff) as u32,
            ))
        }
    }

    pub fn update(&mut self, dt: f64) {
        // update spheres
        for sphere in self.spheres.iter_mut() {
            sphere.update(dt);
        }

        // check collisions
        let n = self.spheres.len();

        for i in 0..(n - 1) {
            for j in (i + 1)..n {
                let s1 = &self.spheres[i];
                let s2 = &self.spheres[j];

                let distance_sq = (s2.x - s1.x) * (s2.x - s1.x) + (s2.y - s1.y) * (s2.y - s1.y);

                if self.is_collide(s1, s2, distance_sq) {
                    (self.spheres[i].r, self.spheres[j].r) =
                        self.handle_collision(s1, s2, distance_sq);
                }
            }
        }

        // cleanup
        for i in (0..n).rev() {
            if self.spheres[i].r <= 1.0 {
                self.spheres.remove(i);
            }
        }
    }

    fn is_collide(&self, s1: &Sphere, s2: &Sphere, distance_sq: f64) -> bool {
        let r_total_sq = (s1.r + s2.r) * (s1.r + s2.r);

        return distance_sq <= r_total_sq;
    }

    fn handle_collision(&self, s1: &Sphere, s2: &Sphere, distance_sq: f64) -> (f64, f64) {
        let bigger: &Sphere = if s1.r > s2.r { s1 } else { s2 };

        return self.absorb(s1, s2, bigger, distance_sq);
    }

    fn absorb(&self, s1: &Sphere, s2: &Sphere, eater: &Sphere, distance_sq: f64) -> (f64, f64) {
        let eaten = if eater == s1 { s2 } else { s1 };
        let eater_r: f64;
        let eaten_r: f64;

        if distance_sq <= eater.r * eater.r + eaten.r * eaten.r {
            eater_r = f64::min(
                f64::sqrt(eater.r * eater.r + eaten.r * eaten.r),
                MAX_SPHERE_R,
            );
            eaten_r = 0.0;
        } else {
            let distance = f64::sqrt(distance_sq);

            let r1 = distance * 0.5
                + f64::sqrt(0.5 * (eater.r * eater.r + eaten.r * eaten.r) - distance_sq * 0.25);

            eater_r = f64::min(r1, MAX_SPHERE_R);
            eaten_r = distance - eater_r;
        }

        if eater == s1 {
            return (eater_r, eaten_r);
        } else {
            return (eaten_r, eater_r);
        }
    }
}
