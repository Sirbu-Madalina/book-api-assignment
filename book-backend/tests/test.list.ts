process.env.NODE_ENV = "test";

import { test } from "@playwright/test";

// import test cases
import health from "./health.test";
import authTestCollection from "./auth.test";
import bookTestCollection from "./book.test";
import authValidationTestCollection from "./auth-validation.test";
import passwordResetValidationTestCollection from "./password-reset-validation.test";
import bookAuthorizationTestCollection from "./book-authorization.test";
import sessionAuthorizationTestCollection from "./session-authorization.test";
import bookshelfAuthorizationTestCollection from "./bookshelf-authorization.test";

import dotenvFlow from "dotenv-flow";
dotenvFlow.config();

// if later you want db cleanup:
// import { connect, disconnect } from "../src/repository/database";
// import { userModel } from "../src/models/userModel";
// import { bookModel } from "../src/models/bookModel";

function setup() {
  test.beforeEach(async () => {
    // optional cleanup here
  });

  test.afterAll(async () => {
    // optional cleanup here
  });
}

setup();

test.describe(health);
test.describe(authTestCollection);
test.describe(bookTestCollection);
test.describe(authValidationTestCollection);
test.describe(passwordResetValidationTestCollection);
test.describe(bookAuthorizationTestCollection);
test.describe(sessionAuthorizationTestCollection);
test.describe(bookshelfAuthorizationTestCollection);
