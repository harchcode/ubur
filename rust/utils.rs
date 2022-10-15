use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    pub fn log(s: &str);

    #[wasm_bindgen(js_namespace = Math)]
    pub fn random() -> f64;
}

pub fn rand_int(min: usize, max: usize) -> usize {
    (random() * (max - min) as f64 + min as f64) as usize
}
