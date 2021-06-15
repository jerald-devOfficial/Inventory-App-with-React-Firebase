import React, { Component } from 'react';
import { compose } from 'react-recompose';

import { AuthUserContext, withAuthorization, withEmailVerification } from '../Session';
import { withFirebase } from '../Firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

import * as ROLES from '../../constants/roles';

const HomePage = () => (
  <div>
    <Stocks />
  </div>
);

class StocksBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      amount: '',
      jobCollections: [],
      requestedAmount: 0,
      returnedAmount: 0,
      totalRequestedAmount: 0,
      totalReturnedAmount: 0,
      loading: false,
      stocks: [],
      limit: 3
    };
  }

  componentDidMount() {
    this.onListenForStocks();
  }

  onListenForStocks() {
    this.setState({ loading: true });

    this.props.firebase
      .stocks()
      .orderByChild('createdAt')
      .limitToLast(this.state.limit)
      .on('value', (snapshot) => {
        const stockObject = snapshot.val();

        if (stockObject) {
          const stockList = Object.keys(stockObject).map((key) => ({
            ...stockObject[key],
            uid: key
          }));
          this.setState({
            stocks: stockList,
            loading: false
          });
        } else {
          this.setState({ stocks: null, loading: false });
        }
      });
  }

  componentWillUnmount() {
    this.props.firebase.stocks().off();
  }

  onChangeName = (event) => {
    this.setState({ name: event.target.value });
  };

  onChangeAmount = (event) => {
    this.setState({ amount: event.target.value });
  };

  onCreateStock = (event, authUser) => {
    this.props.firebase.stocks().push({
      name: this.state.name,
      amount: this.state.amount,
      requestedAmount: this.state.requestedAmount,
      jobCollections: this.state.jobCollections,
      returnedAmount: this.state.returnedAmount,
      totalRequestedAmount: this.state.totalRequestedAmount,
      totalReturnedAmount: this.state.totalReturnedAmount,
      userId: authUser.uid,
      username: authUser.username.split(' ')[0],
      createdAt: this.props.firebase.serverValue.TIMESTAMP
    });

    this.setState({ name: '', amount: '' });

    event.preventDefault();
  };

  onRemoveStock = (uid) => {
    this.props.firebase.stock(uid).remove();
  };

  onEditStock = (stock, name, amount) => {
    const { uid, ...stockSnapshot } = stock;

    this.props.firebase.stock(stock.uid).set({
      ...stockSnapshot,
      name,
      amount,
      editedAt: this.props.firebase.serverValue.TIMESTAMP
    });
  };

  onRequestStock = (stock, requestedAmount) => {
    const { uid, ...stockSnapshot } = stock;

    this.props.firebase.stock(stock.uid).set({
      ...stockSnapshot,
      requestedAmount,
      requestedAt: this.props.firebase.serverValue.TIMESTAMP
    });
  };

  onReturnStock = (stock, returnedAmount) => {
    const { uid, ...stockSnapshot } = stock;

    this.props.firebase.stock(stock.uid).set({
      ...stockSnapshot,
      returnedAmount,
      returnedAt: this.props.firebase.serverValue.TIMESTAMP
    });
  };

  onApproveRequestedStock = (stock) => {
    const { uid, ...stockSnapshot } = stock;

    this.props.firebase.stock(stock.uid).set({
      ...stockSnapshot,
      amount: stock.amount - stock.requestedAmount,
      totalRequestedAmount: Number(stock.totalRequestedAmount) + Number(stock.requestedAmount),
      requestedAmount: 0,
      approvedRequestedAt: this.props.firebase.serverValue.TIMESTAMP
    });
  };

  onApproveReturnedStock = (stock) => {
    const { uid, ...stockSnapshot } = stock;

    this.props.firebase.stock(stock.uid).set({
      ...stockSnapshot,
      amount: Number(stock.amount) + Number(stock.returnedAmount),
      totalRequestedAmount: stock.totalRequestedAmount - stock.returnedAmount,
      totalReturnedAmount: Number(stock.totalReturnedAmount) + Number(stock.returnedAmount),
      returnedAmount: 0,
      approvedReturnedAt: this.props.firebase.serverValue.TIMESTAMP
    });
  };

  onDeclineRequestedStock = (stock) => {
    const { uid, ...stockSnapshot } = stock;

    this.props.firebase.stock(stock.uid).set({
      ...stockSnapshot,
      requestedAmount: 0,
      declinedRequestedAt: this.props.firebase.serverValue.TIMESTAMP
    });
  };

  onDeclineReturnedStock = (stock) => {
    const { uid, ...stockSnapshot } = stock;

    this.props.firebase.stock(stock.uid).set({
      ...stockSnapshot,
      returnedAmount: 0,
      declinedReturnedAt: this.props.firebase.serverValue.TIMESTAMP
    });
  };

  onAddToCollections = (stock, jobCollections) => {
    const { uid, ...stockSnapshot } = stock;

    this.props.firebase.stock(stock.uid).set({
      ...stockSnapshot,
      jobCollections: jobCollections.push(stock.name),
      editedAt: this.props.firebase.serverValue.TIMESTAMP
    });
  };

  onNextPage = () => {
    this.setState((state) => ({ limit: state.limit + 3 }), this.onListenForStocks);
  };

  render() {
    const { name, amount, stocks, loading } = this.state;

    // console.log('number of Stocks created: ', stocks.length);
    return (
      <AuthUserContext.Consumer>
        {(authUser) => (
          <>
            {!!authUser.roles[ROLES.ADMIN] && (
              <div className="mt-8">
                <div className=" bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Stocks</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Create a new entry of stock on this form
                    </p>
                  </div>
                  <div className="border-t border-gray-200">
                    <dl>
                      <form onSubmit={(event) => this.onCreateStock(event, authUser)}>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-10 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500 sm:col-span-3 mt-2">
                            Add New Item
                          </dt>
                          <div class=" text-sm text-gray-900 sm:mt-0 sm:col-span-3">
                            <div class="w-full inline-flex border-b">
                              <input
                                class="w-full focus:outline-none focus:text-gray-600 p-2"
                                placeholder="Name"
                                type="text"
                                value={name}
                                onChange={this.onChangeName}
                                required
                              />
                            </div>
                          </div>

                          <div class=" text-sm text-gray-900 sm:mt-0 sm:col-span-3">
                            <div class="w-full inline-flex border-b">
                              <input
                                class="w-full focus:outline-none focus:text-gray-600 p-2"
                                placeholder="Amount"
                                type="number"
                                value={amount}
                                min="1"
                                onChange={this.onChangeAmount}
                                required
                              />
                            </div>
                          </div>

                          <div class=" text-sm text-gray-900 sm:mt-0 sm:col-span-1">
                            <button
                              type="submit"
                              class="text-white w-full mx-auto w-xs bg-blue-500 hover:bg-blue-700 rounded-md text-center  py-1 flex items-center justify-center focus:outline-none md:float-right"
                            >
                              <FontAwesomeIcon icon={faPaperPlane} size="2x" />
                            </button>
                          </div>
                        </div>
                      </form>
                    </dl>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="mt-4 -mb-4 text-center">
                <FontAwesomeIcon icon={faCircleNotch} className="animate-spin text-green-500" />
              </div>
            )}

            {stocks ? (
              <StockList
                authUser={authUser}
                stocks={stocks}
                onEditStock={this.onEditStock}
                onRemoveStock={this.onRemoveStock}
                onRequestStock={this.onRequestStock}
                onReturnStock={this.onReturnStock}
                onAddToCollections={this.onAddToCollections}
                onApproveRequestedStock={this.onApproveRequestedStock}
                onApproveReturnedStock={this.onApproveReturnedStock}
                onDeclineRequestedStock={this.onDeclineRequestedStock}
                onDeclineReturnedStock={this.onDeclineReturnedStock}
              />
            ) : (
              <div className="mt-8 text-center">
                <span className="text-white mx-auto py-2 px-4 w-xs bg-gray-500 hover:bg-gray-700 rounded-md">
                  Inventory is empty.
                </span>
              </div>
            )}

            {!loading && stocks && (
              <div className="mt-4 text-center">
                <button
                  className="text-white mx-auto py-1 px-4 w-xs bg-blue-500 hover:bg-blue-700 rounded-md"
                  type="button"
                  onClick={this.onNextPage}
                >
                  More
                </button>
              </div>
            )}
          </>
        )}
      </AuthUserContext.Consumer>
    );
  }
}

const StockList = ({
  authUser,
  stocks,
  onEditStock,
  onRemoveStock,
  onRequestStock,
  onAddToCollections,
  onReturnStock,
  onApproveRequestedStock,
  onApproveReturnedStock,
  onDeclineRequestedStock,
  onDeclineReturnedStock
}) => (
  <div className="flex flex-col mt-8">
    <div className="-my-2 py-2 overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="align-middle inline-block min-w-full shadow overflow-hidden sm:rounded-lg border-b border-gray-200">
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th class="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th class="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th class="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Requests
              </th>
              <th class="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Returns
              </th>
              <th class="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {stocks.map((stock) => (
              <StockItem
                authUser={authUser}
                key={stock.uid}
                stock={stock}
                onEditStock={onEditStock}
                onRemoveStock={onRemoveStock}
                onRequestStock={onRequestStock}
                onReturnStock={onReturnStock}
                onAddToCollections={onAddToCollections}
                onApproveRequestedStock={onApproveRequestedStock}
                onApproveReturnedStock={onApproveReturnedStock}
                onDeclineRequestedStock={onDeclineRequestedStock}
                onDeclineReturnedStock={onDeclineReturnedStock}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

class StockItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editMode: false,
      requestMode: false,
      returnMode: false,
      editName: this.props.stock.name,
      editAmount: this.props.stock.amount,
      requestedAmount: this.props.stock.requestedAmount,
      returnedAmount: this.props.stock.returnedAmount
    };
  }

  onToggleEditMode = () => {
    this.setState((state) => ({
      editMode: !state.editMode,
      editName: this.props.stock.name,
      editAmount: this.props.stock.amount
    }));
  };

  onToggleRequestMode = () => {
    this.setState((state) => ({
      requestMode: !state.requestMode,
      requestedAmount: this.props.stock.requestedAmount
    }));
  };

  onToggleReturnMode = () => {
    this.setState((state) => ({
      returnMode: !state.returnMode,
      returnedAmount: this.props.stock.returnedAmount
    }));
  };

  onChangeRequestAmount = (event) => {
    this.setState({ requestedAmount: event.target.value });
  };

  onChangeReturnAmount = (event) => {
    this.setState({ returnedAmount: event.target.value });
  };

  onChangeEditName = (event) => {
    this.setState({ editName: event.target.value });
  };

  onChangeEditAmount = (event) => {
    this.setState({ editAmount: event.target.value });
  };

  onSaveEditStock = () => {
    this.props.onEditStock(this.props.stock, this.state.editName, this.state.editAmount);

    this.setState({ editMode: false });
  };

  onSaveRequestStock = () => {
    this.props.onRequestStock(this.props.stock, this.state.requestedAmount);

    this.setState({ requestMode: false });
  };

  onSaveReturnStock = () => {
    this.props.onReturnStock(this.props.stock, this.state.returnedAmount);

    this.setState({ returnMode: false });
  };

  onSaveApproveRequestedStock = () => {
    this.props.onApproveRequestedStock(this.props.stock);
  };

  onSaveApproveReturnedStock = () => {
    this.props.onApproveReturnedStock(this.props.stock);
  };

  onSaveDeclineRequestedStock = () => {
    this.props.onDeclineRequestedStock(this.props.stock);
  };

  onSaveDeclineReturnedStock = () => {
    this.props.onDeclineReturnedStock(this.props.stock);
  };

  onSaveAddToCollections = () => {
    this.props.onAddToCollections(this.props.stock);
  };

  render() {
    const { authUser, stock, onRemoveStock } = this.props;
    const {
      editMode,
      editName,
      editAmount,
      returnMode,
      requestMode,
      requestedAmount,
      returnedAmount
    } = this.state;

    const isInvalidRequest = requestedAmount > stock.amount;

    console.log('Stock Amount: ', stock.amount);

    console.log('Requested Amount: ', requestedAmount);

    console.log('Returned Firebase Amount: ', stock.returnedAmount);

    const isInvalidReturn = returnedAmount > stock.requestedAmount;

    const isRequestingOrReturning = requestMode || returnMode;

    return (
      <tr>
        {!!authUser.roles[ROLES.ADMIN] ? (
          // Admin
          <>
            {editMode ? (
              <>
                <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  <input
                    type="text"
                    value={editName}
                    onChange={this.onChangeEditName}
                    class="text-sm leading-5 focus:outline-none focus:text-gray-600"
                    placeholder="Edit Name"
                    required
                  />
                </td>
                <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  <input
                    type="number"
                    min="1"
                    value={editAmount}
                    onChange={this.onChangeEditAmount}
                    class="text-sm leading-5 focus:outline-none focus:text-gray-600"
                    placeholder="Edit Value"
                    required
                  />
                </td>
                <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  <div className="text-sm leading-5 text-gray-900">Edit Mode</div>
                </td>
                <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  <div className="text-sm leading-5 text-gray-900">
                    {stock.requestedAmount > 0 ? (
                      <>
                        <button
                          class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-50 text-green-500 hover:bg-green-500 hover:text-green-50"
                          onClick={this.onSaveApproveRequestedStock}
                        >
                          Approve
                        </button>{' '}
                        <button
                          class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-red-50"
                          onClick={this.onSaveDeclineRequestedStock}
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <span>No Requests</span>
                    )}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  <div className="text-sm leading-5 text-gray-900">
                    {stock.returnedAmount > 0 ? (
                      <>
                        <button
                          class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-50 text-green-500 hover:bg-green-500 hover:text-green-50"
                          onClick={this.onSaveApproveReturnedStock}
                        >
                          Approve
                        </button>{' '}
                        <button
                          class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-red-50"
                          onClick={this.onSaveDeclineReturnedStock}
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <span>No Returns</span>
                    )}
                  </div>
                </td>
              </>
            ) : (
              <>
                <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  <div className="text-sm leading-5 text-gray-900">{stock.name}</div>
                </td>
                <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  <div className="text-sm leading-5 text-gray-900">{stock.amount}</div>
                </td>
                <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  <div className="text-sm leading-5 text-gray-900">
                    {stock.editedAt ? <span>(Edited)</span> : <span>No Action</span>}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  <div className="text-sm leading-5 text-gray-900">
                    {stock.requestedAmount > 0 ? (
                      <>
                        <button
                          class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-50 text-green-500 hover:bg-green-500 hover:text-green-50"
                          onClick={this.onSaveApproveRequestedStock}
                        >
                          Approve
                        </button>{' '}
                        <button
                          class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-red-50"
                          onClick={this.onSaveDeclineRequestedStock}
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <span>No Requests</span>
                    )}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  <div className="text-sm leading-5 text-gray-900">
                    {stock.returnedAmount > 0 ? (
                      <>
                        <button
                          class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-50 text-green-500 hover:bg-green-500 hover:text-green-50"
                          onClick={this.onSaveApproveReturnedStock}
                        >
                          Approve
                        </button>{' '}
                        <button
                          class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-red-50"
                          onClick={this.onSaveDeclineReturnedStock}
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <span>No Returns</span>
                    )}
                  </div>
                </td>
              </>
            )}
            {authUser.uid === stock.userId && (
              <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                <div className="text-sm leading-5 text-gray-900">
                  {editMode ? (
                    <>
                      <button
                        type="button"
                        onClick={this.onSaveEditStock}
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-blue-50"
                      >
                        Save
                      </button>
                      &emsp;
                      <button
                        type="button"
                        onClick={this.onToggleEditMode}
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-50 text-gray-500 hover:bg-gray-500 hover:text-gray-50"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={this.onToggleEditMode}
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-50 text-green-500 hover:bg-green-500 hover:text-green-50"
                    >
                      Edit
                    </button>
                  )}

                  {!editMode && (
                    <button
                      type="button"
                      onClick={() => onRemoveStock(stock.uid)}
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-red-50"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </td>
              // End of Admin
            )}
          </>
        ) : (
          // User
          <>
            <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
              <div className="text-sm leading-5 text-gray-900">{stock.name}</div>
            </td>
            {isRequestingOrReturning ? (
              <>
                {requestMode && (
                  <>
                    <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                      <input
                        type="number"
                        min="1"
                        value={requestedAmount}
                        onChange={this.onChangeRequestAmount}
                        class="text-sm leading-5 focus:outline-none focus:text-gray-600"
                        placeholder="Request amount"
                        required
                      />
                    </td>
                    <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                      <div className="text-sm leading-5 text-gray-900">Request Mode</div>
                    </td>
                    <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                      <div className="text-sm leading-5 text-gray-900">No Requests</div>
                    </td>
                    <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                      <div className="text-sm leading-5 text-gray-900">No Returns</div>
                    </td>
                  </>
                )}

                {returnMode && (
                  <>
                    <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                      <input
                        type="number"
                        min="1"
                        value={returnedAmount}
                        onChange={this.onChangeReturnAmount}
                        class="text-sm leading-5 focus:outline-none focus:text-gray-600"
                        placeholder="Return amount"
                        required
                      />
                    </td>
                    <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                      <div className="text-sm leading-5 text-gray-900">Return Mode</div>
                    </td>
                    <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                      <div className="text-sm leading-5 text-gray-900">No Requests</div>
                    </td>
                    <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                      <div className="text-sm leading-5 text-gray-900">No Returns</div>
                    </td>
                  </>
                )}
              </>
            ) : (
              <>
                <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  <div className="text-sm leading-5 text-gray-900">{stock.amount}</div>
                </td>
                <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  <div className="text-sm leading-5 text-gray-900">
                    {stock.requestedAt || stock.returnedAt ? (
                      <>
                        {stock.requestedAt && <span>(Requested {stock.requestedAmount})</span>}

                        {stock.returnedAt && <span>(Returned {stock.returnedAmount})</span>}
                      </>
                    ) : (
                      <span>No Request/Return</span>
                    )}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  <div className="text-sm leading-5 text-gray-900">No Requests</div>
                </td>
                <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  <div className="text-sm leading-5 text-gray-900">No Returns</div>
                </td>
              </>
            )}

            {stock.userId && (
              <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                <div className="text-sm leading-5 text-gray-900">
                  {isRequestingOrReturning ? (
                    <>
                      {requestMode && (
                        <>
                          <button
                            type="button"
                            onClick={this.onSaveRequestStock}
                            class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-blue-50 ${
                              isInvalidRequest && 'opacity-50'
                            }`}
                          >
                            Save Request
                          </button>
                          &emsp;
                          <button
                            type="button"
                            onClick={this.onToggleRequestMode}
                            class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-50 text-gray-500 hover:bg-gray-500 hover:text-gray-50"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {returnMode && (
                        <>
                          <button
                            type="button"
                            onClick={this.onSaveReturnStock}
                            class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-blue-50 ${
                              isInvalidReturn && 'opacity-50'
                            }`}
                          >
                            Save Return
                          </button>
                          &emsp;
                          <button
                            type="button"
                            onClick={this.onToggleReturnMode}
                            class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-50 text-gray-500 hover:bg-gray-500 hover:text-gray-50"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={this.onToggleRequestMode}
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-50 text-green-500 hover:bg-green-500 hover:text-green-50"
                      >
                        Request
                      </button>

                      <button
                        type="button"
                        onClick={this.onToggleReturnMode}
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-red-50"
                      >
                        Return
                      </button>

                      <button
                        type="button"
                        onClick={this.onSaveAddToCollections}
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-red-50"
                      >
                        Add to Collections
                      </button>
                    </>
                  )}
                </div>
              </td>
            )}
          </>
          // End of User
        )}
      </tr>
    );
  }
}

const Stocks = withFirebase(StocksBase);

const condition = (authUser) => !!authUser;

export default compose(withEmailVerification, withAuthorization(condition))(HomePage);
