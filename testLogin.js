var usersMap = {"user1": "abc123", "user2": "pass"}; // setting up obj representing data from mongoDB

function isValPassTest(user, pass, usersMap) {
    if (user === "") { // check if user input is empty
        return false;
    }
    if (user in usersMap) {
        var userPass = usersMap[user];
        if (pass === userPass) { // check if input pass is correct
            return true;
        }
        return false;
    }
    return false; // false if user is not in db
}

function isUserTakenTest(user, usersMap) {
    if (user in usersMap) { // checking for user as a key in the object corresponding to mongoDB data
        return true;
    }
    return false;
}

function addUserTest(user, pass, usersMap) {
    if (isUserTakenTest(user, usersMap) === false && pass !== "" && user !== "") { // only add user if the user is not taken,
        usersMap[user] = pass;                                                 // the user is not empty, and the pass is not empty
    }
}


var expect = require("chai").expect;

// Tests for isValPass
expect(isValPassTest("user1", "abc123", usersMap)).to.equal(true); // Valid input
expect(isValPassTest("user1", "Abc123", usersMap)).to.equal(false); // Wrong capitalization
expect(isValPassTest("user1", "pass", usersMap)).to.equal(false); // pass for the wrong user
expect(isValPassTest("", "pass", usersMap)).to.equal(false); // Empty user input
expect(isValPassTest("user1", "", usersMap)).to.equal(false); // Empty pass input
expect(isValPassTest("user3", "", usersMap)).to.equal(false); // user not in db


// Tests for isUserTaken
expect(isUserTakenTest("user1", usersMap)).to.equal(true); // user taken
expect(isUserTakenTest("User1", usersMap)).to.equal(false); // Wrong capitalization
expect(isUserTakenTest("user12", usersMap)).to.equal(false); // Existing user + additional character
expect(isUserTakenTest("abc123", usersMap)).to.equal(false); // pass of existing user


// Tests for addUse
addUserTest("user1", "asd", usersMap);
expect(usersMap).to.eql({"user1": "abc123", "user2": "pass"}); // attempt to add existing user does not change object
addUserTest("User1", "asd", usersMap);
expect(usersMap).to.eql({"user1": "abc123", "user2": "pass", "User1" : "asd"}); // added user with different capitalization
addUserTest("user3", "hfdh", usersMap);
expect(usersMap).to.eql({"user1": "abc123", "user2": "pass", "User1" : "asd", "user3": "hfdh"}); // added new user
addUserTest("", "hfdh", usersMap);
expect(usersMap).to.eql({"user1": "abc123", "user2": "pass", "User1" : "asd", "user3": "hfdh"}); // attempt to add empty user does nothing
addUserTest("awr", "", usersMap);
expect(usersMap).to.eql({"user1": "abc123", "user2": "pass", "User1" : "asd", "user3": "hfdh"}); // attempt to add empty pass does nothing

