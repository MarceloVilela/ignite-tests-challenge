import { v4 as uuidv4 } from "uuid";

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";

import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

import { GetStatementOperationError } from "./GetStatementOperationError";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let getStatementOperationUseCase: GetStatementOperationUseCase;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Get Statement Operation", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(
      usersRepositoryInMemory
    );

    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory,
    );
  });

  it("should be able to get statement", async () => {
    const user = {
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123pass",
    };

    const userCreated = await createUserUseCase.execute(user);
    expect(userCreated).toHaveProperty("id");

    const deposit = {
      type: 'deposit' as OperationType,
      amount: 99,
      description: 'sample deposit',
      user_id: String(userCreated.id)
    };

    const depositResult = await createStatementUseCase.execute(deposit);
    expect(depositResult).toHaveProperty("id");

    const withdraw = {
      type: 'withdraw' as OperationType,
      amount: 99,
      description: 'sample withdraw',
      user_id: String(userCreated.id)
    };
    const withdrawResult = await createStatementUseCase.execute(withdraw);
    expect(withdrawResult).toHaveProperty("id");

    const getOperationDeposit = await getStatementOperationUseCase.execute({
      user_id: String(userCreated.id),
      statement_id: String(depositResult.id)
    });

    const getOperationWithdraw = await getStatementOperationUseCase.execute({
      user_id: String(userCreated.id),
      statement_id: String(withdrawResult.id)
    });
    
    expect(getOperationDeposit).toMatchObject(depositResult);
    expect(getOperationWithdraw).toMatchObject(withdrawResult);
  });

  it("should not be able to get statement with non-existing user", async () => {
    expect((async () => {
      const withdrawResult = await getStatementOperationUseCase.execute({
        user_id: uuidv4(), 
        statement_id: uuidv4()
      });
    })).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get non-existing statement", async () => {
    const user = {
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123pass",
    };

    const userCreated = await createUserUseCase.execute(user);
    expect(userCreated).toHaveProperty("id");

    expect((async () => {
      await getStatementOperationUseCase.execute({
        user_id: String(userCreated.id), 
        statement_id: uuidv4()
      });
    })).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});