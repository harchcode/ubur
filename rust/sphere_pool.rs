use std::{collections::HashMap, hash::Hash, vec};

use crate::utils::next_power_of_2;

pub struct Pool<T> {
    objs: Vec<T>,
    is_alive: Vec<bool>,
    objs_id_map: HashMap<*const T, usize>,
    available_ids: Vec<usize>,
    current_size: usize,
    create_fn: fn() -> T,
}

impl<T> Pool<T> {
    pub fn new(create_fn: fn() -> T, initial_size: usize) -> Pool<T> {
        let mut x = Pool {
            objs: vec![],
            is_alive: vec![],
            objs_id_map: HashMap::new(),
            available_ids: vec![],
            current_size: 0,
            create_fn,
        };

        x.expand(initial_size);

        x
    }

    pub fn expand(&mut self, new_size: usize) {
        for i in self.current_size..new_size {
            let new_obj = (self.create_fn)();

            self.objs_id_map.insert(&new_obj, i);

            // let is_alive = self.is_alive.entry(i).or_insert(false);
            // *is_alive = false;

            self.is_alive.push(false);
            self.available_ids.push(i);
        }
    }

    pub fn get(&self, id: usize) -> &T {
        return &self.objs[id];
    }

    pub fn get_id(&self, obj: &T) -> usize {
        return *self.objs_id_map.get(&(obj as *const T)).unwrap();
    }

    // pub fn get_all(&mut self, out: &mut Vec<&T>) {
    //     for i in 0..self.objs.len() {
    //         let v = &self.objs[i];

    //         let id = *self.objs_id_map.get(&(v as *const T)).unwrap();

    //         if self.is_alive[id] {
    //             out.push(v);
    //         }
    //     }
    // }

    pub fn obtain(&mut self) -> &T {
        if self.available_ids.len() == 0 {
            self.expand(next_power_of_2(self.current_size + 1));
        }

        if let Some(id) = self.available_ids.pop() {
            self.is_alive[id] = false;
            let obj = self.get(id);

            return obj;
        } else {
            panic!("Not found");
        }
    }

    pub fn free(&mut self, id: usize) {
        self.is_alive[id] = false;
        self.available_ids.push(id);
    }

    pub fn free_obj(&mut self, obj: &T) {
        let id = *self.objs_id_map.get(&(obj as *const T)).unwrap();
        self.free(id);
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

    pub fn iter(&self) -> PoolIter<'_, T> {
        PoolIter {
            pool: self,
            cur_id: 0,
        }
    }
}

pub struct PoolIter<'a, T> {
    pool: &'a Pool<T>,
    cur_id: usize,
}
impl<'a, T> Iterator for PoolIter<'a, T> {
    type Item = &'a T;

    fn next(&mut self) -> Option<Self::Item> {
        let pool = self.pool;
        let n = pool.objs.len();

        while self.cur_id < n && !pool.is_alive[self.cur_id] {
            self.cur_id += 1;
        }

        if self.cur_id >= n {
            return None;
        } else {
            return Some(&pool.objs[self.cur_id]);
        }
    }
}

// struct PoolIterMut<'a, T> {
//     pool: &'a mut Pool<T>,
//     cur_id: usize,
// }
// impl<'a, T> Iterator for PoolIterMut<'a, T> {
//     type Item = &'a mut T;

//     fn next(&mut self) -> Option<Self::Item> {
//         let pool = &mut self.pool;
//         let n = pool.objs.len();

//         while self.cur_id < n && !pool.is_alive[self.cur_id] {
//             self.cur_id += 1;
//         }

//         if self.cur_id >= n {
//             return None;
//         } else {
//             return Some(Box::new(&mut pool.objs[self.cur_id]));
//         }
//     }
// }
