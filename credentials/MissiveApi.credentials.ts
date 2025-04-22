import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class MissiveApi implements ICredentialType {
  name = 'missiveApi';
  displayName = 'Missive API';
  documentationUrl = 'https://missiveapp.com/help/api-documentation';
  properties: INodeProperties[] = [
    {
      displayName: 'API Token',
      name: 'apiToken',
      type: 'string',
      default: '',
      required: true,
    },
  ];
}
