DROP DATABASE IF EXISTS employee_trackerDB;
CREATE DATABASE employee_trackerDB;

USE employee_trackerDB;

CREATE TABLE department(
id INTEGER AUTO_INCREMENT,
dept_name VARCHAR(30),
PRIMARY KEY(id)
);

CREATE TABLE role(
id INTEGER AUTO_INCREMENT,
title VARCHAR(30),
salary DECIMAL,
department_id INTEGER,
PRIMARY KEY(id)
);

CREATE TABLE employee(
id INTEGER AUTO_INCREMENT,
first_name VARCHAR(30),
last_name VARCHAR(30),
role_id INTEGER,
MANAGER_ID INTEGER,
PRIMARY KEY(id)

); 

-- seed data

INSERT INTO department (dept_name) VALUES ("Engineering"),("Research and Development"),("Operations"),("Accounting"), ("Security");
INSERT INTO role (title, salary, department_id) VALUES ("Software Engineer", 80000, 1), ("Engineering Technician",50000,1), ("Research Scientist", 100000, 2), ("Research Assistant", 35000, 2), ("Project Coordinator", 65000, 3), ("Chief Operations Officer", 150000, 3), ("Accountant",75000, 4), ("Chief Financial Officer", 175000,4), ("Security Guard", 45000, 4), ("Security Lead", 55000,4);
INSERT INTO employee (first_name, last_name, role_id) VALUES ("Jane", "Doe", 1), ("John", "Doe", 5), ("Joe", "Bogus", 8), ("Sally", "Madeup", 6);

SELECT first_name, last_name, title, MANAGER_ID, salary, dept_name FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id;