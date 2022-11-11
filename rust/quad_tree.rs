// A custom, incorrect Quad Tree implementation that only store usize id
// But it works

pub struct IdQuad {
    data: Vec<usize>,
    children: Vec<Box<IdQuad>>,
    x: f64,
    y: f64,
    w: f64,
    h: f64,
}

impl IdQuad {
    pub fn new(x: f64, y: f64, w: f64, h: f64) -> IdQuad {
        IdQuad {
            data: Vec::with_capacity(4),
            children: Vec::with_capacity(4),
            x,
            y,
            w,
            h,
        }
    }

    fn _clear(node: &mut IdQuad) {
        node.data.clear();

        for i in 0..node.children.len() {
            IdQuad::_clear(&mut node.children[i]);
        }
    }

    pub fn clear(&mut self) {
        IdQuad::_clear(self);
    }

    fn _insert(node: &mut IdQuad, id: usize, x: f64, y: f64, w: f64, h: f64) {
        // if not intersecting, return
        if !_intersects(node, x, y, w, h) {
            return;
        }

        // if no children and data size is smaller than the limit (4), insert data to the node
        if node.children.len() == 0 && node.data.len() < 4 {
            node.data.push(id);

            return;
        }

        // if no children, create the children
        if node.children.len() == 0 {
            let hw = node.w * 0.5;
            let hh = node.h * 0.5;

            let tl = IdQuad::new(node.x, node.y, hw, hh);
            let tr = IdQuad::new(node.x + hw, node.y, hw, hh);
            let bl = IdQuad::new(node.x, node.y + hh, hw, hh);
            let br = IdQuad::new(node.x + hw, node.y + hh, hw, hh);

            node.children.push(Box::new(tl));
            node.children.push(Box::new(tr));
            node.children.push(Box::new(bl));
            node.children.push(Box::new(br));
        }

        for i in 0..4 {
            IdQuad::_insert(&mut node.children[i], id, x, y, w, h);
        }
    }

    pub fn insert(&mut self, id: usize, x: f64, y: f64, w: f64, h: f64) {
        IdQuad::_insert(self, id, x, y, w, h);
    }

    fn _get_data_in_region(node: &IdQuad, x: f64, y: f64, w: f64, h: f64, hs: &mut Vec<usize>) {
        // if not intersecting, return
        if !_intersects(node, x, y, w, h) {
            return;
        }

        // insert the data
        for i in 0..node.data.len() {
            hs.push(node.data[i]);
        }

        // get data for all children
        for i in 0..node.children.len() {
            IdQuad::_get_data_in_region(&node.children[i], x, y, w, h, hs);
        }
    }

    pub fn get_data_in_region(&self, x: f64, y: f64, w: f64, h: f64, hs: &mut Vec<usize>) {
        hs.clear();

        IdQuad::_get_data_in_region(self, x, y, w, h, hs);
    }
}

fn _intersects(node: &IdQuad, x: f64, y: f64, w: f64, h: f64) -> bool {
    let nl = node.x;
    let nt = node.y;
    let nr = node.x + node.w;
    let nb = node.y + node.h;
    let tl = x;
    let tt = y;
    let tr = x + w;
    let tb = y + h;

    return nr >= tl && nl <= tr && nb >= tt && nt <= tb;
}
