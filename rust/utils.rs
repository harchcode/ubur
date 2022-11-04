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

pub fn next_power_of_2(value: usize) -> usize {
    if value <= 0 {
        return 1;
    };

    let mut result = value;

    result -= 1;
    result |= result >> 1;
    result |= result >> 2;
    result |= result >> 4;
    result |= result >> 8;
    result |= result >> 16;
    result += 1;

    return result;
}

pub fn rand_u32(min: u32, max: u32) -> u32 {
    (random() * (max - min) as f64 + min as f64) as u32
}

pub fn rand_color(min: u32, max: u32) -> u32 {
    let r = rand_u32(min, max);
    let g = rand_u32(min, max);
    let b = rand_u32(min, max);

    return r * 0x10000 + g * 0x100 + b;
}

pub fn darken_color(color: u32, multiplier: f64) -> u32 {
    let mut n = color;

    let b = (((n % 0x100) as f64) * multiplier) as u32;
    n /= 0x100;

    let g = (((n % 0x100) as f64) * multiplier) as u32;
    n /= 100;

    let r = (((n % 0x100) as f64) * multiplier) as u32;
    n /= 100;

    return r * 0x10000 + g * 0x100 + b;
}

// export function setColorArr(out: Float32Array, color: number, opacity = 1) {
//   color |= 0;

//   out[3] = opacity;

//   for (let i = 2; i >= 0; i--) {
//     out[i] = (color % 0x100) / 0xff;
//     color = (color / 0x100) | 0;
//   }
// }
