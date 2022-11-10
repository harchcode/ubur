// A custom, incorrect Quad Tree implementation that only store usize id
// But it works
#[derive(PartialEq, Clone)]
pub struct IdNode {
    data: Vec<usize>,
    children: Vec<Box<IdNode>>,
    x: f64,
    y: f64,
    w: f64,
    h: f64,
}

impl IdNode {
    pub fn empty() -> IdNode {
        IdNode {
            data: Vec::with_capacity(4),
            children: Vec::with_capacity(4),
            x: 0.0,
            y: 0.0,
            w: 0.0,
            h: 0.0,
        }
    }

    pub fn new(x: f64, y: f64, w: f64, h: f64) -> IdNode {
        IdNode {
            data: Vec::with_capacity(4),
            children: Vec::with_capacity(4),
            x,
            y,
            w,
            h,
        }
    }
}

pub struct IdQuadTree {
    root: Box<IdNode>,
}

impl IdQuadTree {
    pub fn new(x: f64, y: f64, w: f64, h: f64) -> IdQuadTree {
        IdQuadTree {
            root: Box::new(IdNode::new(x, y, w, h)),
        }
    }

    fn _clear(node: &mut IdNode) {
        node.data.clear();

        for i in 0..node.children.len() {
            IdQuadTree::_clear(&mut node.children[i]);
        }
    }

    pub fn clear(&mut self) {
        IdQuadTree::_clear(&mut self.root);
    }

    fn _insert(node: &mut IdNode, id: usize, x: f64, y: f64, w: f64, h: f64) {
        // if not intersecting, return
        if !_intersects(node, x, y, w, h) {
            return;
        }

        // if no children and data size is smaller than the limit (4), insert data to the node
        if node.data.len() < 4 {
            node.data.push(id);

            return;
        }

        // if no children, create the children
        if node.children.len() == 0 {
            let hw = node.w * 0.5;
            let hh = node.h * 0.5;

            let tl = IdNode::new(node.x, node.y, hw, hh);
            let tr = IdNode::new(node.x + hw, node.y, hw, hh);
            let bl = IdNode::new(node.x, node.y + hh, hw, hh);
            let br = IdNode::new(node.x + hw, node.y + hh, hw, hh);

            node.children.push(Box::new(tl));
            node.children.push(Box::new(tr));
            node.children.push(Box::new(bl));
            node.children.push(Box::new(br));
        }

        for i in 0..4 {
            IdQuadTree::_insert(&mut node.children[i], id, x, y, w, h);
        }
    }

    pub fn insert(&mut self, id: usize, x: f64, y: f64, w: f64, h: f64) {
        IdQuadTree::_insert(&mut self.root, id, x, y, w, h);
    }

    fn _get_data_in_region(node: &IdNode, x: f64, y: f64, w: f64, h: f64, hs: &mut Vec<usize>) {
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
            IdQuadTree::_get_data_in_region(&node.children[i], x, y, w, h, hs);
        }
    }

    pub fn get_data_in_region(&self, x: f64, y: f64, w: f64, h: f64, hs: &mut Vec<usize>) {
        hs.clear();

        IdQuadTree::_get_data_in_region(&self.root, x, y, w, h, hs);
    }
}

fn _intersects(node: &IdNode, x: f64, y: f64, w: f64, h: f64) -> bool {
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
