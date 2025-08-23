import { EveApiCategory, EveApiEndpoint } from './types';

export const EVE_API_BASE_URL = 'https://esi.evetech.net/latest';

export const API_CATEGORIES: EveApiCategory[] = [
  {
    name: 'Alliance',
    description: 'Access alliance information and member corporations',
    endpoints: [
      {
        path: '/alliances/',
        method: 'GET',
        summary: 'List all alliances',
        description: 'Get a list of all active player alliances',
        parameters: [],
        requiresAuth: false,
        category: 'Alliance'
      },
      {
        path: '/alliances/{alliance_id}/',
        method: 'GET',
        summary: 'Get alliance information',
        description: 'Get public information about an alliance',
        parameters: [
          {
            name: 'alliance_id',
            in: 'path',
            required: true,
            type: 'integer',
            description: 'An EVE alliance ID'
          }
        ],
        requiresAuth: false,
        category: 'Alliance'
      },
      {
        path: '/alliances/{alliance_id}/corporations/',
        method: 'GET',
        summary: 'List alliance\'s corporations',
        description: 'List all corporations that are members of an alliance',
        parameters: [
          {
            name: 'alliance_id',
            in: 'path',
            required: true,
            type: 'integer',
            description: 'An EVE alliance ID'
          }
        ],
        requiresAuth: false,
        category: 'Alliance'
      }
    ]
  },
  {
    name: 'Character',
    description: 'Access character information and data',
    endpoints: [
      {
        path: '/characters/{character_id}/',
        method: 'GET',
        summary: 'Get character\'s public information',
        description: 'Get public information about a character',
        parameters: [
          {
            name: 'character_id',
            in: 'path',
            required: true,
            type: 'integer',
            description: 'An EVE character ID'
          }
        ],
        requiresAuth: false,
        category: 'Character'
      },
      {
        path: '/characters/{character_id}/portrait/',
        method: 'GET',
        summary: 'Get character portraits',
        description: 'Get portrait urls for a character',
        parameters: [
          {
            name: 'character_id',
            in: 'path',
            required: true,
            type: 'integer',
            description: 'An EVE character ID'
          }
        ],
        requiresAuth: false,
        category: 'Character'
      },
      {
        path: '/characters/{character_id}/wallet/',
        method: 'GET',
        summary: 'Get character wallet balance',
        description: 'Get a character\'s wallet balance',
        parameters: [
          {
            name: 'character_id',
            in: 'path',
            required: true,
            type: 'integer',
            description: 'An EVE character ID'
          }
        ],
        requiresAuth: true,
        category: 'Character'
      }
    ]
  },
  {
    name: 'Corporation',
    description: 'Access corporation information and data',
    endpoints: [
      {
        path: '/corporations/{corporation_id}/',
        method: 'GET',
        summary: 'Get corporation information',
        description: 'Get public information about a corporation',
        parameters: [
          {
            name: 'corporation_id',
            in: 'path',
            required: true,
            type: 'integer',
            description: 'An EVE corporation ID'
          }
        ],
        requiresAuth: false,
        category: 'Corporation'
      },
      {
        path: '/corporations/{corporation_id}/members/',
        method: 'GET',
        summary: 'Get corporation members',
        description: 'Get a list of all members of a corporation',
        parameters: [
          {
            name: 'corporation_id',
            in: 'path',
            required: true,
            type: 'integer',
            description: 'An EVE corporation ID'
          }
        ],
        requiresAuth: true,
        category: 'Corporation'
      }
    ]
  },
  {
    name: 'Universe',
    description: 'Access universe data like systems, stations, and types',
    endpoints: [
      {
        path: '/universe/systems/',
        method: 'GET',
        summary: 'Get solar systems',
        description: 'Get a list of solar systems',
        parameters: [],
        requiresAuth: false,
        category: 'Universe'
      },
      {
        path: '/universe/systems/{system_id}/',
        method: 'GET',
        summary: 'Get solar system information',
        description: 'Get information on a solar system',
        parameters: [
          {
            name: 'system_id',
            in: 'path',
            required: true,
            type: 'integer',
            description: 'System ID'
          }
        ],
        requiresAuth: false,
        category: 'Universe'
      },
      {
        path: '/universe/types/{type_id}/',
        method: 'GET',
        summary: 'Get type information',
        description: 'Get information on a type',
        parameters: [
          {
            name: 'type_id',
            in: 'path',
            required: true,
            type: 'integer',
            description: 'An EVE item type ID'
          }
        ],
        requiresAuth: false,
        category: 'Universe'
      }
    ]
  },
  {
    name: 'Market',
    description: 'Access market data and orders',
    endpoints: [
      {
        path: '/markets/{region_id}/orders/',
        method: 'GET',
        summary: 'List orders in a region',
        description: 'Return a list of orders in a region',
        parameters: [
          {
            name: 'region_id',
            in: 'path',
            required: true,
            type: 'integer',
            description: 'Return orders in this region'
          },
          {
            name: 'order_type',
            in: 'query',
            required: true,
            type: 'string',
            description: 'Filter buy/sell orders. Valid values: "buy", "sell", "all"'
          },
          {
            name: 'type_id',
            in: 'query',
            required: false,
            type: 'integer',
            description: 'Return orders only for this type'
          }
        ],
        requiresAuth: false,
        category: 'Market'
      },
      {
        path: '/markets/prices/',
        method: 'GET',
        summary: 'List market prices',
        description: 'Return a list of prices',
        parameters: [],
        requiresAuth: false,
        category: 'Market'
      }
    ]
  }
];

export function findEndpoint(path: string, method: string): EveApiEndpoint | undefined {
  for (const category of API_CATEGORIES) {
    const endpoint = category.endpoints.find(
      ep => ep.path === path && ep.method === method
    );
    if (endpoint) return endpoint;
  }
  return undefined;
}

export function getAllEndpoints(): EveApiEndpoint[] {
  return API_CATEGORIES.flatMap(category => category.endpoints);
}