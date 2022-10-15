use crate::external::log;

pub struct World {}

impl World {
    pub fn create() -> World {
        World {}
    }

    pub fn update(&self, dt: f64) {
        log(&format!("{}", dt));
    }
}
