use crate::utils::next_power_of_2;

pub struct Pool<T> {
    pub objs: Vec<T>,
    is_alive: Vec<bool>,
    available_ids: Vec<usize>,
    current_size: usize,
    create_fn: fn() -> T,
}

impl<T> Pool<T> {
    pub fn new(create_fn: fn() -> T, initial_size: usize) -> Pool<T> {
        let mut x = Pool {
            objs: Vec::with_capacity(initial_size),
            is_alive: Vec::with_capacity(initial_size),
            available_ids: Vec::with_capacity(initial_size),
            current_size: 0,
            create_fn,
        };

        x.expand(initial_size);

        x
    }

    pub fn expand(&mut self, new_size: usize) {
        for i in self.current_size..new_size {
            let new_obj = (self.create_fn)();

            self.objs.push(new_obj);
            self.is_alive.push(false);
            self.available_ids.push(i);
        }

        self.current_size = new_size;
    }

    pub fn get(&self, id: usize) -> &T {
        return &self.objs[id];
    }

    pub fn get_mut(&mut self, id: usize) -> &mut T {
        return &mut self.objs[id];
    }

    pub fn get_alive_ids(&mut self, r: &mut Vec<usize>) {
        r.clear();

        for id in 0..self.objs.len() {
            if self.is_alive[id] {
                r.push(id);
            }
        }
    }

    pub fn obtain(&mut self) -> (usize, &mut T) {
        if self.available_ids.len() == 0 {
            self.expand(next_power_of_2(self.current_size + 1));
        }

        let id = self.available_ids.pop().unwrap();
        self.is_alive[id] = true;
        let obj = &mut self.objs[id];

        return (id, obj);
    }

    pub fn free(&mut self, id: usize) {
        self.is_alive[id] = false;
        self.available_ids.push(id);
    }

    pub fn clear(&mut self) {
        self.available_ids.clear();

        for i in 0..self.current_size {
            self.is_alive[i] = false;
            self.available_ids.push(i);
        }
    }

    pub fn len(&self) -> usize {
        self.current_size - self.available_ids.len()
    }
}
