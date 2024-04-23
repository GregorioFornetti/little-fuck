
import { lobbys, players } from "../../../global";
import { handleJoinLobby } from "../../../events/lobby/handlers/joinLobby";
import Lobby from "../../../interfaces/Lobby";

import { clientSocket, player, io } from "../setupTests";


describe("handleJoinLobby", () => {

  test("Tentar entrar em sala inexistente deve emitir erro", (done) => {

  });

  test("Tentar entrar em uma sala com jogo em andamento deve emitir erro", (done) => {

  });

  test("Nome vazio deve emitir erro", (done) => {

  });

  test("Nome apenas com espaços deve emitir erro", (done) => {

  });

  test("Nome repetido deve emitir erro", (done) => {

  });

  test("Tentar entrar em lobby com jogador já em outro lobby deve emitir erro", (done) => {

  });

  describe("Entrar em lobby de forma válida", () => {
    describe("Com um jogador entrando no lobby", () => {
      test("Deve emitir sucesso ao cliente que entrou no lobby", (done) => {

      })

      test("Deve cadastrar o jogador no lobby", () => {

      })

      test("Deve cadastar o lobby no jogador", () => {

      })

      test("Deve emitir para todos os jogadores do lobby que um novo jogador entrou", () => {

      })
    })

    describe("Com dois jogadores entrando no lobby", () => {
      test("Deve emitir sucesso aos clientes que entraram no lobby", (done) => {

      })

      test("Deve cadastrar os jogadores no lobby", () => {

      })

      test("Deve cadastar o lobby nos jogadores", () => {

      })

      test("Deve emitir para todos os jogadores do lobby que novos jogadores entraram", () => {

      })
    })
  })
});