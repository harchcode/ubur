use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    pub fn log(s: &str);

    #[wasm_bindgen(js_namespace = Math)]
    pub fn random() -> f64;
}

pub fn rand(min: f64, max: f64) -> f64 {
    random() * (max - min) + min
}

pub fn rand_int(min: i32, max: i32) -> i32 {
    (random() * (max - min) as f64 + min as f64) as i32
}
