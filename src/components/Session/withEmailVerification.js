import React from 'react';

import AuthUserContext from './context';
import { withFirebase } from '../Firebase';

const withEmailVerification = (Component) => {
  class WithEmailVerification extends React.Component {
    constructor(props) {
      super(props);
      this.state = { isSent: false };
    }

    onSendEmailVerification = () => {
      this.props.firebase.doSendEmailVerification().then(() => this.setState({ isSent: true }));
    };

    render() {
      return (
        <AuthUserContext.Consumer>
          {(authUser) =>
            needsEmailVerification(authUser) ? (
              <div className="mt-20 bg-white overflow-hidden">
                <div class="max-w-lg bg-white shadow-md rounded-lg overflow-hidden mx-auto">
                  <div class="py-4 px-8 mt-3">
                    {this.state.isSent ? (
                      <div class="flex flex-col mb-8">
                        <h3 className="text-gray-700 font-semibold text-2xl tracking-wide mb-2">
                          E-Mail confirmation sent to {authUser.email}
                        </h3>
                        <p className="text-gray-500 text-base">
                          Hi {authUser.username}! Please check your E-Mails (Spam folder included)
                          for a confirmation E-Mail. Refresh this page once you confirmed your
                          E-Mail.
                        </p>
                      </div>
                    ) : (
                      <div class="flex flex-col mb-8">
                        <h3 className="text-gray-700 font-semibold text-2xl tracking-wide mb-2">
                          Verify your Email {authUser.email}
                        </h3>
                        <p className="text-gray-500 text-base">
                          Hi {authUser.username}! Please check your E-Mails (Spam folder included)
                          for a confirmation E-Mail or send another confirmation E-Mail.
                        </p>
                      </div>
                    )}
                    <div class="py-4">
                      <button
                        type="button"
                        onClick={this.onSendEmailVerification}
                        disabled={this.state.isSent}
                        className={`block tracking-widest uppercase text-center shadow bg-indigo-600 hover:bg-indigo-700 focus:shadow-outline focus:outline-none text-white text-xs py-3 px-10 rounded ${
                          this.state.isSent && 'opacity-50'
                        }`}
                      >
                        Send confirmation E-Mail
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Component {...this.props} />
            )
          }
        </AuthUserContext.Consumer>
      );
    }
  }

  return withFirebase(WithEmailVerification);
};

const needsEmailVerification = (authUser) =>
  authUser &&
  !authUser.emailVerified &&
  authUser.providerData.map((provider) => provider.providerId).includes('password');

export default withEmailVerification;
