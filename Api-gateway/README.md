# CEUB — Arquitetura de Software

## Descrição do Projeto
Criar um sistema de **venda de ingressos online**, desenvolvido com uma arquitetura robusta em **4 camadas**, garantindo **escalabilidade**, **manutenibilidade** e **alta disponibilidade**.

---

## Arquitetura do Projeto

### Camada de Apresentação (APP1, APP2)
- Frontends que interagem com o API Gateway.
- Podem ser aplicativos mobile, web ou sistemas terceiros.

### Camada de API Gateway + Balanceador
- Centraliza, autentica, roteia e protege as requisições.
- O balanceador distribui a carga entre as instâncias do backend.

### Camada de Serviço (SERVER1, REPLICA1)
- Implementa a lógica de negócio.
- Segue o padrão arquitetural **MVC**, isolando responsabilidades entre dados, regras e interface.

### Camada de Dados (BD)
- Banco de dados relacional que garante persistência e integridade dos dados.

---

## Modelo Arquitetural MVC

- **Model (Modelo)**  
  Representa as entidades do sistema, mapeando para tabelas no banco de dados. Também contém regras e validações específicas dos dados.

- **View (Visão)**  
  Neste projeto, a view corresponde aos **endpoints expostos na API**, que servem como interface de comunicação com os frontends e sistemas externos.

- **Controller (Controlador)**  
  Faz a ponte entre os modelos e as views. Processa as requisições, aplica as regras de negócio e retorna as respostas.

---

## Responsabilidades do Grupo

| Nome              | Responsabilidade                                                                                 |
|-------------------|-------------------------------------------------------------------------------------------------|
| Giovanna Lima      | Implementação da **Camada de Dados** (Model/DAO) e scripts do banco de dados.                  |
| Rômulo Araujo      | Desenvolvimento da **Camada de Serviço** (Controllers e regras de negócio).                    |
| João Augusto B.    | Implementação do **API Gateway**, configuração do **Balanceador** e deploy backend.            |
| Marcones Queiroz   | Desenvolvimento dos **Apps Frontend** (APP1 e APP2) e configuração de testes (**Postman**).    |
| Eduardo Rocha      | Documentação do projeto, criação do diagrama de arquitetura e integração entre as camadas.      |

---

## Instruções de Uso da Postman Collection

1. **Importe a Collection**
   - Abra o Postman.
   - Clique em **“Import”**.
   - Selecione o arquivo `.json` da collection (fornecido na pasta `/docs` ou compartilhado pela equipe).

2. **Configure o Ambiente**
   - Crie um ambiente no Postman com a variável `{{base_url}}`.
   - Exemplo:
     ```
     base_url = http://localhost:3000
     ```

3. **Execute os Testes**
   - Selecione a requisição desejada.
   - Preencha os parâmetros necessários (body, headers, params).
   - Clique em **“Send”**.

4. **Fluxo de Teste Sugerido**
   - Criar usuário
   - Realizar autenticação
   - Criar evento
   - Consultar eventos
   - Comprar ingresso

---




