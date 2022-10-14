use std::array::from_fn;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    #[wasm_bindgen(js_namespace = Math)]
    fn random() -> f64;
}

#[wasm_bindgen]
#[repr(u8)]
#[derive(PartialEq, Clone, Copy)]
pub enum Difficulty {
    Easiest,
    Easy,
    Normal,
    Hard,
    Hardest,
}

fn rand_int(min: usize, max: usize) -> usize {
    (random() * (max - min) as f64 + min as f64) as usize
}

fn get_row_index(cell_index: usize) -> usize {
    cell_index / 9
}

fn get_col_index(cell_index: usize) -> usize {
    cell_index % 9
}

fn get_block_index(cell_index: usize) -> usize {
    let r = get_row_index(cell_index);
    let c = get_col_index(cell_index);

    if r <= 2 {
        if c <= 2 {
            return 0;
        } else if c >= 3 && c <= 5 {
            return 1;
        } else if c >= 6 && c <= 8 {
            return 2;
        }
    } else if r >= 3 && r <= 5 {
        if c <= 2 {
            return 3;
        } else if c >= 3 && c <= 5 {
            return 4;
        } else if c >= 6 && c <= 8 {
            return 5;
        }
    } else if r >= 6 && r <= 8 {
        if c <= 2 {
            return 6;
        } else if c >= 3 && c <= 5 {
            return 7;
        } else if c >= 6 && c <= 8 {
            return 8;
        }
    }

    return usize::MAX;
}

fn is_conflict(board: &[u8; 81], cell_index: usize, cell_value: u8) -> bool {
    for i in 0..81 {
        if i == cell_index {
            continue;
        }

        let test_cell = board[i];

        if test_cell < 1 || test_cell > 9 {
            continue;
        }
        if cell_value != test_cell {
            continue;
        }

        if get_row_index(cell_index) == get_row_index(i) {
            return true;
        }

        if get_col_index(cell_index) == get_col_index(i) {
            return true;
        }

        if get_block_index(cell_index) == get_block_index(i) {
            return true;
        }
    }

    return false;
}

fn shift9(arr: &mut [u8; 9], index: usize) {
    for i in index..(arr.len() - 1) {
        arr[i] = arr[i + 1];
    }
}

fn shift81<T: Copy>(arr: &mut [T; 81], index: usize) {
    for i in index..(arr.len() - 1) {
        arr[i] = arr[i + 1];
    }
}

fn generate_terminal_pattern(board: &mut [u8; 81]) {
    let mut test: [[u8; 9]; 81] = [from_fn(|i| (i + 1) as u8); 81];
    let mut s: [usize; 81] = [9; 81];
    let mut c: usize = 0;

    while c < 81 {
        if s[c] > 0 {
            let x = rand_int(0, s[c]);
            let y = test[c][x];

            if !is_conflict(&board, c, y) {
                board[c] = y;
                shift9(&mut test[c], x);
                s[c] -= 1;
                c += 1;
            } else {
                shift9(&mut test[c], x);
                s[c] -= 1;
            }
        } else {
            test[c] = from_fn(|i| (i + 1) as u8);
            s[c] = 9;
            c -= 1;
            board[c] = 0;
        }
    }
}

fn col_block_propagation(board: &mut [u8; 81], index1: usize, index2: usize) {
    let mut id1 = index1 * 3;
    let mut id2 = index2 * 3;

    for _ in 0..9 {
        for _ in 0..3 {
            let tmp = board[id1];
            board[id1] = board[id2];
            board[id2] = tmp;

            id1 += 1;
            id2 += 1;
        }

        id1 += 6;
        id2 += 6;
    }
}

fn row_block_propagation(board: &mut [u8; 81], index1: usize, index2: usize) {
    let mut id1 = index1 * 27;
    let mut id2 = index2 * 27;

    for _ in 0..27 {
        let tmp = board[id1];
        board[id1] = board[id2];
        board[id2] = tmp;

        id1 += 1;
        id2 += 1;
    }
}

fn get_given_count_and_max_empty_from_difficulty(difficulty: Difficulty) -> (usize, u8) {
    match difficulty {
        Difficulty::Easiest => (rand_int(50, 56), 4),
        Difficulty::Easy => (rand_int(36, 49), 5),
        Difficulty::Normal => (rand_int(32, 35), 6),
        Difficulty::Hard => (rand_int(28, 31), 7),
        Difficulty::Hardest => (22, 9),
    }
}

fn solve(givens: &[u8; 81], solution: &mut [u8; 81]) -> bool {
    let mut test: [[u8; 9]; 81] = [from_fn(|i| (i + 1) as u8); 81];

    let mut s: [usize; 81] = [9; 81];
    let mut c = 0;

    for i in 0..81 {
        solution[i] = givens[i];
    }

    while c < 81 {
        if givens[c] > 0 && givens[c] < 10 {
            c += 1;

            continue;
        }

        if s[c] > 0 {
            s[c] -= 1;
            let y = test[c][s[c]];

            if !is_conflict(&solution, c, y) {
                solution[c] = y;
                c += 1;
            }
        } else {
            test[c] = from_fn(|i| (i + 1) as u8);
            s[c] = 9;

            if c == 0 {
                return false;
            }

            c -= 1;

            while givens[c] > 0 && givens[c] < 10 {
                if c == 0 {
                    return false;
                }

                c -= 1;
            }

            solution[c] = 0;
        }
    }

    return true;
}

fn generate(difficulty: Difficulty, givens: &mut [u8; 81]) {
    let mut solutions: [u8; 81] = [0; 81];

    generate_terminal_pattern(givens);

    let mut current_givens = 81;
    let mut empty_cells_in_row: [u8; 9] = [0; 9];
    let mut empty_cells_in_column: [u8; 9] = [0; 9];
    let mut empty_cells_in_block: [u8; 9] = [0; 9];
    let mut cell_to_dig = from_fn(|i| i);
    let mut s = 81;

    let (total_givens, max_empty) = get_given_count_and_max_empty_from_difficulty(difficulty);

    while s > 0 && current_givens > total_givens {
        let k = match difficulty {
            Difficulty::Hardest => s - 1,
            _ => rand_int(0, s),
        };

        let i = cell_to_dig[k];

        if difficulty == Difficulty::Hardest {
            s -= 1;
            shift81(&mut cell_to_dig, s);
        } else {
            s -= 1;
            shift81(&mut cell_to_dig, k);
        }

        let tmp = givens[i];
        let mut unique = true;

        let row = get_row_index(i);
        let col = get_col_index(i);
        let block = get_block_index(i);

        if empty_cells_in_block[block] >= max_empty
            && empty_cells_in_column[col] >= max_empty
            && empty_cells_in_row[row] >= max_empty
        {
            continue;
        }

        for j in 1..10 {
            if j == tmp {
                continue;
            }

            if is_conflict(&givens, i, j) {
                continue;
            }

            givens[i] = j;

            if solve(&givens, &mut solutions) {
                unique = false;
                break;
            }
        }

        if unique {
            givens[i] = 0;
            empty_cells_in_row[row] += 1;
            empty_cells_in_column[col] += 1;
            empty_cells_in_block[block] += 1;
            current_givens -= 1;
        } else {
            givens[i] = tmp;
        }
    }

    if difficulty == Difficulty::Hardest {
        let id1 = rand_int(0, 3);
        let id2 = rand_int(0, 3);

        if id1 != id2 {
            col_block_propagation(givens, id1, id2)
        }

        let id1 = rand_int(0, 3);
        let id2 = rand_int(0, 3);

        if id1 != id2 {
            row_block_propagation(givens, id1, id2)
        }
    }
}

fn check_conflict(board: &[u8; 81]) -> bool {
    for i in 0..81 {
        let cell = board[i];

        if cell < 1 || cell > 9 {
            continue;
        } else if is_conflict(board, i, cell) {
            return true;
        }
    }

    return false;
}

fn is_empty(board: &[u8; 81]) -> bool {
    for i in 0..81 {
        if board[i] > 0 && board[i] < 10 {
            return false;
        }
    }

    return true;
}
#[wasm_bindgen]
pub struct Sudoku {
    board: [u8; 81],
    givens: [u8; 81],
}

#[wasm_bindgen]
impl Sudoku {
    pub fn new() -> Sudoku {
        Sudoku {
            board: [0; 81],
            givens: [0; 81],
        }
    }

    pub fn get_board(&self) -> *const u8 {
        self.board.as_ptr()
    }

    pub fn get_givens(&self) -> *const u8 {
        self.givens.as_ptr()
    }

    pub fn reset(&mut self) {
        self.board = [0; 81];
        self.givens = [0; 81];
    }

    pub fn generate(&mut self, difficulty: Difficulty) {
        self.board = [0; 81];
        self.givens = [0; 81];

        generate(difficulty, &mut self.givens);

        self.board = self.givens;

        // log(&format!("board: {:?}", self.board));
        // log(&format!("givens: {:?}", self.givens));
    }

    pub fn clear(&mut self) {
        self.board = self.givens;
    }

    pub fn check(&mut self) -> bool {
        for i in 0..81 {
            let cell = self.board[i];

            if cell < 1 || cell > 9 {
                return false;
            } else if is_conflict(&self.board, i, cell) {
                return false;
            }
        }

        return true;
    }

    pub fn set_value(&mut self, index: usize, value: u8) {
        self.board[index] = value;
    }

    pub fn solve(&mut self) -> bool {
        let is_board_empty = is_empty(&self.board);
        let is_givens_empty = is_empty(&self.givens);

        if is_givens_empty {
            if check_conflict(&self.board) {
                return false;
            }

            let mut solution: [u8; 81] = [0; 81];
            let r = solve(&self.board, &mut solution);

            if !r {
                return false;
            }

            if !is_board_empty {
                self.givens = self.board;
            }

            self.board = solution;

            return true;
        } else {
            let mut solution: [u8; 81] = [0; 81];
            let r = solve(&self.givens, &mut solution);

            if !r {
                return false;
            }

            self.board = solution;

            return true;
        }
    }
}
