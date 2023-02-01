import { v4 as uuidv4 } from "uuid";

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";

import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

import { GetBalanceError } from "./GetBalanceError";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let getBalanceUseCase: GetBalanceUseCase;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Get Balance", () => {
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

    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepositoryInMemory,
      usersRepositoryInMemory,
    );
  });

  it("should be able to get balance", async () => {
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

    const balanceResult = await getBalanceUseCase.execute({user_id: String(userCreated.id)});

    expect(balanceResult.balance).toEqual(depositResult.amount - withdrawResult.amount);
    
    expect(balanceResult.statement[0]).toMatchObject(depositResult);
    expect(balanceResult.statement[1]).toMatchObject(withdrawResult);
  });

  it("should not be able to get balance with non-existing user", async () => {
    expect((async () => {
      const withdrawResult = await getBalanceUseCase.execute({user_id: uuidv4()});
    })).rejects.toBeInstanceOf(GetBalanceError);
  });
});