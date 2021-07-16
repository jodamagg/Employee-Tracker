const mysql = require("mysql");
const cTable = require("console.table");
const inquirer = require("inquirer");

const connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Be sure to update with your own MySQL password!
  password: "MonteCarlo314",
  database: "employee_trackerDB",
});

//Generates Overall Summary Table of all Employees, Roles, and Departments
function queryAll() {
  //Chained Inner Join of all 3 Tables on appropriate foreign keys
  connection.query(
    "SELECT first_name, last_name, title, MANAGER_ID, salary, dept_name FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id;",
    (err, res) => {
      if (err) throw err;

      const table = cTable.getTable(res);
      console.log(table);

      mainMenu();
    }
  );
}

//following functions show info by Department, Role, and Employee Respectively
function viewDepartment() {
  //query DB for all departments to form prompt list
  connection.query("SELECT dept_name FROM department", (err, res) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          type: "rawlist",
          message: "For which department do you wish to obtain info?",
          choices() {
            const deptArray = [];
            res.forEach(({ dept_name }) => {
              deptArray.push(dept_name);
            });
            return deptArray;
          },
          name: "deptChoice",
        },
      ])
      .then((response) => {
        //query DB for relevant results to display
        connection.query(
          `SELECT first_name, last_name, title, MANAGER_ID, salary, dept_name FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE dept_name = "${response.deptChoice}"`,
          (err, res) => {
            if (err) throw err;
            const table = cTable.getTable(res);
            console.log(table);

            mainMenu();
          }
        );
      });
  });
}

function viewRole() {
  //query DB for all roles to form prompt list
  connection.query("SELECT title FROM role", (err, res) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          type: "rawlist",
          message: "For which role do you wish to obtain info?",
          choices() {
            const roleArray = [];
            res.forEach(({ title }) => {
              roleArray.push(title);
            });
            return roleArray;
          },
          name: "roleChoice",
        },
      ])
      .then((response) => {
        //query DB for relevant results to display
        connection.query(
          `SELECT first_name, last_name, title, MANAGER_ID, salary, dept_name FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE title = "${response.roleChoice}"`,
          (err, res) => {
            if (err) throw err;
            const table = cTable.getTable(res);
            console.log(table);

            mainMenu();
          }
        );
      });
  });
}

function viewEmployee() {
  //query DB for all employees to obtain list info
  connection.query("SELECT first_name, last_name FROM employee", (err, res) => {
    if (err) throw err;

    const nameArray = [];

    //concatenate first and last name fields in table for list prompt

    for (let i = 0; i < res.length; i++) {
      let fullName = res[i].first_name + " " + res[i].last_name;
      nameArray.push(fullName);
    }

    inquirer
      .prompt([
        {
          type: "rawlist",
          message: "For which employee would you like to see information?",
          choices: nameArray,
          name: "empChoice",
        },
      ])
      .then((response) => {
        //obtain records just for desired employee

        //employee id will be corresponding index in nameArray +1 by design
        let empID = nameArray.indexOf(response.empChoice) + 1;
        connection.query(
          `SELECT first_name, last_name, title, MANAGER_ID, salary, dept_name FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE employee.id = "${empID}"`,
          (err, res) => {
            if (err) throw err;
            const table = cTable.getTable(res);
            console.log(table);

            mainMenu();
          }
        );
      });
  });
}

function viewByManager() {
  //query DB for all employees to obtain list info
  connection.query("SELECT first_name, last_name FROM employee", (err, res) => {
    if (err) throw err;

    const nameArray = [];

    //concatenate first and last name fields in table for list prompt

    for (let i = 0; i < res.length; i++) {
      let fullName = res[i].first_name + " " + res[i].last_name;
      nameArray.push(fullName);
    }

    inquirer
      .prompt([
        {
          type: "rawlist",
          message: "For which manager would you like to see information?",
          choices: nameArray,
          name: "empChoice",
        },
      ])
      .then((response) => {
        //obtain records just for desired employee

        //employee id will be corresponding index in nameArray +1 by design
        let empID = nameArray.indexOf(response.empChoice) + 1;
        connection.query(
          `SELECT first_name, last_name, title, MANAGER_ID, salary, dept_name FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE MANAGER_ID = "${empID}"`,
          (err, res) => {
            if (err) throw err;
            const table = cTable.getTable(res);
            console.log(table);

            mainMenu();
          }
        );
      });
  });
}

//functions that add new departments, roles, and employees
function addDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the name of the department you wish to add?",
        name: "newDepartment",
      },
    ])
    .then((response) => {
      let newDept = response.newDepartment;
      connection.query(
        `INSERT INTO department (dept_name) VALUES ("${newDept}")`,
        (err, res) => {
          if (err) throw err;
          console.log("New Department Added!");
          mainMenu();
        }
      );
    });
}

function addRole() {
  //retrieve list of departments from DB
  connection.query("SELECT dept_name FROM department", (err, res) => {
    if (err) throw err;

    //if no error, use results to prompt user for input
    inquirer
      .prompt([
        {
          type: "input",
          message: "What is the name of the role that you would like to add?",
          name: "newRole",
        },
        {
          type: "input",
          message: "What is the salary of the new position?",
          name: "newSalary",
        },
        {
          type: "rawlist",
          message: "To Which Department Should this Role be Added?",
          choices() {
            const deptArray = [];
            res.forEach(({ dept_name }) => {
              deptArray.push(dept_name);
            });
            return deptArray;
          },

          name: "deptAdd",
        },
      ])
      .then((response) => {
        //query DB for department ID
        connection.query(
          `SELECT id FROM department WHERE dept_name ="${response.deptAdd}"`,
          (err, res) => {
            if (err) throw err;
            let deptID = res[0].id;
            //insert new role to DB based on user input
            connection.query(
              `INSERT INTO role (title, salary, department_id) VALUES ("${response.newRole}", ${response.newSalary}, ${deptID})`,
              (err, res) => {
                if (err) throw err;
                console.log("New Role Added!");
                mainMenu();
              }
            );
          }
        );
      });
  });
}

function addEmployee() {
  //get list of all names for manager selection name array
  let nameArray = [];
  connection.query("SELECT first_name, last_name FROM employee", (err, res) => {
    if (err) throw err;
    //concatenate first and last name fields in table for list prompt
    for (let i = 0; i < res.length; i++) {
      let fullName = res[i].first_name + " " + res[i].last_name;
      nameArray.push(fullName);
    }
  });

  //query DB to get list of current roles
  connection.query(`SELECT title FROM role`, (err, res) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          type: "input",
          message: "What is the first name of the new employee?",
          name: "firstName",
        },
        {
          type: "input",
          message: "What is the last name of the new employee?",
          name: "lastName",
        },
        {
          type: "rawlist",
          message: "What role do you want to assign to this employee?",
          choices() {
            const roleArray = [];
            res.forEach(({ title }) => {
              roleArray.push(title);
            });
            return roleArray;
          },
          name: "roleAssign",
        },
        {
          type: "rawlist",
          message: "Who will this employee report to?",
          choices: nameArray,
          name: "manAssign",
        },
      ])
      .then((response) => {
        //manager id will be corresponding index in nameArray +1 by design
        let manID = nameArray.indexOf(response.manAssign) + 1;

        //query DB for role ID
        connection.query(
          `SELECT id FROM role WHERE title ="${response.roleAssign}"`,
          (err, res) => {
            if (err) throw err;
            let roleID = res[0].id;
            //insert new employee to DB based on user input
            connection.query(
              `INSERT INTO employee (first_name, last_name, role_id, MANAGER_ID) VALUES ("${response.firstName}", "${response.lastName}", ${roleID}, ${manID})`,
              (err, res) => {
                if (err) throw err;
                console.log("New Employee Added!");
                mainMenu();
              }
            );
          }
        );
      });
  });
}

//following function updates employee role
function updateRole() {
  //query DB for all employees to obtain list info
  connection.query("SELECT first_name, last_name FROM employee", (err, res) => {
    if (err) throw err;
    const nameArray = [];
    //concatenate first and last name fields in table for list prompt
    for (let i = 0; i < res.length; i++) {
      let fullName = res[i].first_name + " " + res[i].last_name;
      nameArray.push(fullName);
    }
    //query DB for all roles to obtain list info
    connection.query("SELECT title FROM role", (err, res) => {
      if (err) throw err;
      const roleArray = [];

      //concatenate first and last name fields in table for list prompt

      for (let i = 0; i < res.length; i++) {
        let nextTitle = res[i].title;
        roleArray.push(nextTitle);
      }
      inquirer
        .prompt([
          {
            type: "rawlist",
            message: "For which employee would you like to update a role?",
            choices: nameArray,
            name: "empChoice",
          },
          {
            type: "rawlist",
            message: "Which role would you like to assign this employee?",
            choices: roleArray,
            name: "roleChoice",
          },
        ])
        .then((response) => {
          //update role for designated employee

          //employee id will be corresponding index in nameArray +1 by design, role id wiill be corresponding index in roleArray by design
          let empID = nameArray.indexOf(response.empChoice) + 1;
          let roleID = roleArray.indexOf(response.roleChoice) + 1;
          connection.query(
            `UPDATE employee SET role_id = ${roleID} WHERE id = ${empID}`,
            (err, res) => {
              if (err) throw err;
              console.log("Employee Role Updated!");
              mainMenu();
            }
          );
        });
    });
  });
}

//following function updates employee manager
function updateManager() {
  //get list of all names for employee and manager selection name array
  let nameArray = [];
  connection.query("SELECT first_name, last_name FROM employee", (err, res) => {
    if (err) throw err;
    //concatenate first and last name fields in table for list prompt
    for (let i = 0; i < res.length; i++) {
      let fullName = res[i].first_name + " " + res[i].last_name;
      nameArray.push(fullName);
    }

    inquirer
      .prompt([
        {
          type: "rawlist",
          message:
            "For which employee would you like to make a manager change?",
          choices: nameArray,
          name: "empToChange",
        },
        {
          type: "rawlist",
          message: "Who should this employee report to now?",
          choices: nameArray,
          name: "newManager",
        },
      ])
      .then((response) => {
        //employee id will be corresponding index in nameArray +1 by design
        let changeEmp = nameArray.indexOf(response.empToChange) + 1;
        let newMan = nameArray.indexOf(response.newManager) + 1;
        connection.query(
          `UPDATE employee SET MANAGER_ID = ${newMan} WHERE employee.id = ${changeEmp}`,
          (err, res) => {
            if (err) throw err;
            console.log(newMan);
            console.log(changeEmp);
            console.log("Manager Updated!");
            mainMenu();
          }
        );
      });
  });
}

//main program menu
function mainMenu() {
  console.log("Welcome to Employee Manager. What would you like to do today?");

  let options = [
    "View All Employees",
    "View Employees By Department",
    "View Employees by Role",
    "View Employees by Manager",
    "Add A New Department",
    "Add a New Role",
    "Add a New Employee",
    "Update the Role of an Existing Employee",
    "Update an Employee's Manager",
    "Exit the Program",
  ];

  inquirer
    .prompt([
      {
        type: "rawlist",
        choices: options,
        name: "menuInput",
      },
    ])
    .then((response) => {
      switch (response.menuInput) {
        case options[0]:
          queryAll();
          break;
        case options[1]:
          viewDepartment();
          break;
        case options[2]:
          viewRole();
          break;
        case options[3]:
          viewByManager();
          break;
        case options[4]:
          addDepartment();
          break;
        case options[5]:
          addRole();
          break;
        case options[6]:
          addEmployee();
          break;
        case options[7]:
          updateRole();
          break;
        case options[8]:
          updateManager();
          break;
        case options[9]:
          exit();
          break;
      }
    });
}

function notHere() {
  console.log("Sorry, that feature isn't implemented yet!");
  mainMenu();
}

function exit() {
  connection.end();
}
connection.connect((err) => {
  if (err) throw err;
  // console.log(`connected as id ${connection.threadId}`);
});

mainMenu();
