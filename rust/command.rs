use crate::sphere::Sphere;

pub enum Command {
    Shoot(u32),
}

pub struct Commands {
    commands: Vec<Command>,
}

impl Commands {
    pub fn new() -> Commands {
        Commands { commands: vec![] }
    }

    pub fn push(&mut self, command: Command) {
        self.commands.push(command);
    }

    pub fn execute(&mut self) {
        for command in self.commands.iter() {
            match command {
                Command::Shoot(_shooter_id) => {}
            }
        }

        self.commands.clear();
    }
}
