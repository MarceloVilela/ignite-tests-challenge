import { v4 as uuidv4 } from "uuid";

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";

import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

import { CreateStatementError } from "./CreateStatementError";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Create statement", () => {
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
  });

  it("should be able to make deposit", async () => {
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

    expect(depositResult.type).toEqual(deposit.type);
    expect(depositResult.amount).toEqual(deposit.amount);
    expect(depositResult.description).toEqual(deposit.description);
    expect(depositResult.user_id).toEqual(deposit.user_id);
  });

  it("should be able to make withdraw", async () => {
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
    await createStatementUseCase.execute(deposit);

    const withdraw = {
      type: 'withdraw' as OperationType,
      amount: 99,
      description: 'sample withdraw',
      user_id: String(userCreated.id)
    };
    const withdrawResult = await createStatementUseCase.execute(withdraw);

    expect(withdrawResult.type).toEqual(withdraw.type);
    expect(withdrawResult.amount).toEqual(withdraw.amount);
    expect(withdrawResult.description).toEqual(withdraw.description);
    expect(withdrawResult.user_id).toEqual(withdraw.user_id);
  });

  it("should not be able to deposit/withdraw with non-existing user", async () => {
    expect((async () => {
      const withdraw = {
        type: 'deposit' as OperationType,
        amount: 99,
        description: 'sample withdraw',
        user_id: uuidv4(),
      };

      const withdrawResult = await createStatementUseCase.execute(withdraw);
    })).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to withdraw with InsufficientFunds", async () => {
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
    await createStatementUseCase.execute(deposit);
    
    expect((async () => {
      const withdraw = {
        type: 'withdraw' as OperationType,
        amount: 999,
        description: 'sample withdraw',
        user_id: String(userCreated.id)
      };
      const withdrawResult = await createStatementUseCase.execute(withdraw);
    })).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});