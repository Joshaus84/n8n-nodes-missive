import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { OptionsWithUri } from 'request';

export class Missive implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Missive',
    name: 'missive',
    icon: 'file:missive.svg',
    group: ['transform'],
    version: 1,
    description: 'Interact with the Missive API',
    defaults: {
      name: 'Missive',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'missiveApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        options: [
          { name: 'Conversations', value: 'conversations' },
          { name: 'Messages', value: 'messages' },
        ],
        default: 'conversations',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['conversations'],
          },
        },
        options: [
          { name: 'Get All', value: 'getAll' },
          { name: 'Get by ID', value: 'getById' },
        ],
        default: 'getAll',
      },
      {
        displayName: 'Conversation ID',
        name: 'conversationId',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['conversations'],
            operation: ['getById'],
          },
        },
      },
      {
        displayName: 'Operation',
        name: 'messageOperation',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['messages'],
          },
        },
        options: [
          { name: 'Send Message', value: 'sendMessage' },
        ],
        default: 'sendMessage',
      },
      {
        displayName: 'Body JSON',
        name: 'bodyJson',
        type: 'json',
        default: '{}',
        displayOptions: {
          show: {
            resource: ['messages'],
            messageOperation: ['sendMessage'],
          },
        },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('missiveApi');
    const resource = this.getNodeParameter('resource', 0) as string;

    for (let i = 0; i < items.length; i++) {
      let uri = 'https://api.missiveapp.com/v1';
      let method = 'GET';
      let body: object = {};

      if (resource === 'conversations') {
        const operation = this.getNodeParameter('operation', i) as string;
        if (operation === 'getAll') {
          uri += '/conversations';
        } else if (operation === 'getById') {
          const conversationId = this.getNodeParameter('conversationId', i);
          uri += `/conversations/${conversationId}`;
        }
      }

      if (resource === 'messages') {
        const operation = this.getNodeParameter('messageOperation', i) as string;
        if (operation === 'sendMessage') {
          method = 'POST';
          uri += '/messages';
          body = JSON.parse(this.getNodeParameter('bodyJson', i) as string);
        }
      }

      const options: OptionsWithUri = {
        method,
        uri,
        headers: {
          'Authorization': `Bearer ${credentials.apiToken}`,
          'Content-Type': 'application/json',
        },
        json: true,
        body,
      };

      const response = await this.helpers.request(options);
      returnData.push({ json: response });
    }

    return [returnData];
  }
}
