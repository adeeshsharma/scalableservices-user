const yaml = require('yamljs');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const components = yaml.load('./swagger/components.yaml');
const getUsers = yaml.load('./swagger/get_users.yaml');
const getUserById = yaml.load('./swagger/get_userbyid.yaml');
const postUser = yaml.load('./swagger/post_user.yaml');
const putUserById = yaml.load('./swagger/put_userbyid.yaml');
const deleteUserById = yaml.load('./swagger/delete_userbyid.yaml');

function swaggerInit(appInstance) {
  const allSwagger = {
    ...components,
    paths: {
      ...getUsers,
      ...getUserById,
      ...postUser,
      ...putUserById,
      ...deleteUserById,
    },
  };

  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Order API',
        version: '1.0.0',
        description: 'An API to manage orders',
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT ?? 3000}`,
        },
      ],
      ...allSwagger, // Use the merged Swagger documentation object
    },
    apis: [], // No need to specify the APIs here, as we are providing the documentation directly in the definition
  };

  const specs = swaggerJsdoc(swaggerOptions);
  appInstance.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}

module.exports = swaggerInit;
