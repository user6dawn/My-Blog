declare module 'sib-api-v3-sdk' {
  export default {
    ApiClient: {
      instance: {
        authentications: {
          'api-key': {
            apiKey: string;
          };
        };
      };
    };
    TransactionalEmailsApi: new () => {
      sendTransacEmail(params: {
        sender: { name: string; email: string };
        to: { email: string }[];
        subject: string;
        htmlContent: string;
      }): Promise<any>;
    };
  };
} 