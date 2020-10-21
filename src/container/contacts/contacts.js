import React from 'react';
import * as _ from 'lodash';
import Select from 'react-select';
import copy from 'copy-to-clipboard';
import Toggle from 'react-toggle';
import ReactTable from 'react-table-v6'
import cn from 'classnames'
import moment from 'moment';
import { API } from '../../utils';

import './contacts.css'
import 'react-toggle/style.css'
import 'react-table-v6/react-table.css'

moment().format();

const nationalities = [
    'AU', 'BR', 'CA',
    'CH', 'DE', 'DK',
    'ES', 'FI', 'FR',
    'GB', 'IE', 'IR',
    'NO', 'NL', 'NZ',
    'TR', 'US'
]

const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'AtoZ', label: 'A to Z' },
    { value: 'ZtoA', label: 'Z to A' },
];

class Contacts extends React.Component {

    state = {
        users: [],
        selectedOption: {
            label: "Default",
            value: "default"
        },
        collectionSize: null,
        filteredByNat: null,
        nationalitiesFilter: {
            AU: false,
            BR: false,
            CA: false,
            CH: false,
            DE: false,
            DK: false,
            ES: false,
            FI: false,
            FR: false,
            GB: false,
            IE: false,
            IR: false,
            NO: false,
            NL: false,
            NZ: false,
            TR: false,
            US: false
        },
        femaleFilter: false,
        maleFilter: false,
        femaleCollection: {},
        maleCollection: {},
        nameFilter: '',
        nameCollection: {},
        tableView: true
    }

    componentDidMount() {
        !window.localStorage.getItem('tableViewMode') && window.localStorage.setItem('tableViewMode', true)
        this.setState({
            collectionSize: _.random(10, 50),
            tableView: JSON.parse(window.localStorage.getItem('tableViewMode'))
        }, () => {
            API(this.state.collectionSize).then((res) => {
                this.setState({
                    users: res.data.results,
                    femaleCollection: _.filter(res.data.results, user => user.gender === 'female'),
                    maleCollection: _.filter(res.data.results, user => user.gender === 'male')
                })
            })
        })
    }

    natCheckbox = (nat) => {
        this.setState({
            nationalitiesFilter: {
                ...this.state.nationalitiesFilter,
                [nat]: !this.state.nationalitiesFilter[nat]
            }
        }, () => {
            let filterByNat = _.map(_.pickBy(this.state.nationalitiesFilter), (item, key) => key)
            if (!_.isEmpty(filterByNat)) {
                let filteredByNat = _.flatMap(filterByNat, item => {
                    return _.filter(this.state.users, user => user.nat === item)
                })
                this.setState({
                    filteredByNat
                })
            }
            else {
                this.setState({
                    filteredByNat: []
                })
            }
        })
    }

    nationalitiesCounter = () => {
        return _.map(nationalities, nat => {
            const natLenght = _.filter(this.state.users, user => user.nat === nat).length
            return <div key={nat}>
                <input
                    type="checkbox"
                    disabled={!natLenght}
                    checked={this.state.nationalitiesFilter.nat}
                    onChange={() => this.natCheckbox(nat)}
                />
                {nat}: {natLenght}
            </div>
        })
    }

    genderWinner = () => {
        if (this.state.femaleCollection.length < this.state.maleCollection.length) {
            return 'Мужчин больше'
        }
        if (this.state.femaleCollection.length > this.state.maleCollection.length) {
            return 'Женщин больше'
        } else {
            return 'Паритет'
        }
    }

    update = () => {
        API(this.state.collectionSize).then((res) => {
            this.setState({
                users: res.data.results,
                femaleCollection: _.filter(res.data.results, user => user.gender === 'female'),
                maleCollection: _.filter(res.data.results, user => user.gender === 'male')
            })
        })
    }

    genderCheckbox = (gender) => {
        this.setState({
            [gender]: !this.state[gender]
        })
    }

    genderFilter = () => {
        return <>
            <div>
                <input
                    type="checkbox"
                    checked={this.state.femaleFilter}
                    onChange={() => this.genderCheckbox('femaleFilter')}
                />
                Женщины
            </div>
            <div>
                <input
                    type="checkbox"
                    checked={this.state.maleFilter}
                    onChange={() => this.genderCheckbox('maleFilter')}
                />
                Мужчины
            </div>
        </>
    }

    renderTableView = (data) => {
        const columns = [{
            id: 'name',
            Header: 'Name',
            accessor: user => user.name.first + ' ' + user.name.last,
            width: 150
        }, {
            Header: 'Email',
            accessor: 'email',
            Cell: props => 
                <span 
                    className='copyble' 
                    onClick={() => copy(props.value)}
                >
                    {props.value}
                </span>,
            width: 250
        }, {
            Header: 'Phone',
            accessor: 'phone',
            Cell: props => 
                <span 
                    className='copyble' 
                    onClick={() => copy(props.value)}
                >
                    {props.value}
                </span>,
            width: 120
        }, {
            id: 'address',
            Header: 'Address',
            accessor: user => user.location.street.number + ' ' + user.location.street.name + ' ' + user.location.city + ' ' + user.location.state,
        }, {
            Header: 'Postcode',
            accessor: 'location.postcode',
            width: 80
        }, {
            id: 'birthday',
            Header: 'Birthday',
            accessor: user => moment(user.dob.date).format('MM-DD-YYYY'),
            width: 100
        }]

        return <ReactTable
            className="main-table"
            data={data}
            defaultPageSize={15}
            pageSizeOptions={[5, 10, 15]}
            columns={columns}
        />
    }

    renderTileView = (data) => {
        return _.map(data, (user, index) => {
            return <div key={index}>
                <div className='user'>
                    <div>{user.name.first} {user.name.last}</div>
                    <div className='copyble' onClick={() => copy(user.email)}>{user.email}</div>
                    <div className='copyble' onClick={() => copy(user.phone)}>{user.phone}</div>
                    <div>
                        {user.location.street.number} &nbsp;
                        {user.location.street.name}, &nbsp;
                        {user.location.city}, &nbsp;
                        {user.location.state}, &nbsp;
                        <br />
                        {user.location.postcode}</div>
                    <div>{moment(user.dob.date).format('MM-DD-YYYY')}</div>
                </div>
            </div>
        })
    }

    renderUsers = () => {
        const {
            femaleFilter,
            maleFilter,
            nameFilter,
            filteredByNat,
            femaleCollection,
            maleCollection,
            nameCollection,
            users,
            selectedOption,
            tableView
        } = this.state

        const isFemaleFilterSelected = femaleFilter
        const isMaleFilterSelected = maleFilter
        const isNameFilterSelected = nameFilter
        const isNatFilterSelected = _.isEmpty(filteredByNat)
        let data = []
        if (!isNatFilterSelected) {
            data = filteredByNat
        } else if (isFemaleFilterSelected) {
            data = femaleCollection
        } else if (isMaleFilterSelected) {
            data = maleCollection
        } else if (isNameFilterSelected) {
            data = nameCollection
        } else {
            data = users
        }
        const isSortTypeDefault = selectedOption.value === 'default'
        const isSortTypeAtoZ = selectedOption.value === 'AtoZ'
        let sortedDataAtoZ = []
        if (selectedOption.value === 'AtoZ') {
            sortedDataAtoZ = _.sortBy(data, (item) => item.name.first.toLowerCase())
        }
        let sortedDataZtoA = _.reverse(_.sortBy(data, (item) => item.name.first.toLowerCase()))
        const sortOrder = isSortTypeAtoZ ? sortedDataAtoZ : sortedDataZtoA
        const getCorrentSortType = isSortTypeDefault ? data : sortOrder
        return tableView
            ?
            this.renderTableView(getCorrentSortType)
            :
            this.renderTileView(getCorrentSortType)
    }

    handleChange = selectedOption => {
        this.setState({ selectedOption })
    }

    onNameFilterChange = (e) => {
        this.setState({
            nameFilter: e.target.value,
            nameCollection: _.filter(this.state.users, user => 
                _.startsWith(user.name.first.toLowerCase(), e.target.value.toLowerCase()))
        })
    }

    onViewChange = (e) => {
        this.setState({
            tableView: e.target.checked,
        })
        window.localStorage.setItem('tableViewMode', e.target.checked);
    }

    render() {
        const {
            selectedOption,
            femaleCollection,
            maleCollection,
            users,
            tableView,
            nameFilter
        } = this.state;

        return (
            <div className='main'>
                <div className='main-left'>
                    <div className='main-statistics'>
                        <div className='statistics-title'>Statistics</div>
                        <div className="hello">Размер коллекции: {users.length}</div>
                        <div className="hello">Количество женщин: {femaleCollection.length}</div>
                        <div className="hello">Количество мужчин: {maleCollection.length}</div>
                        {this.genderWinner()}
                    </div>
                    <div className="main-view">
                        Table view <Toggle checked={tableView} onChange={this.onViewChange} />
                    </div>
                    <div className='main-filters'>
                        <div className="filters-title">Filters</div>
                        <button onClick={() => this.update()}>Update</button>
                        <div className="filters-name">
                            <div className="filters-name-title">Name filter</div>
                            <input
                                value={nameFilter}
                                placeholder='Name...'
                                onChange={this.onNameFilterChange}
                            />
                        </div>
                        <div className="filters-gender">
                            <div className="filters-gender-title">Gender filter</div>
                            <div>
                                {this.genderFilter()}
                            </div>
                        </div>
                        <div className="filters-alphabet">
                            <div className="filters-alphabet-title">Alphabet filter</div>
                            <Select
                                className="alphabet-select"
                                value={selectedOption}
                                onChange={this.handleChange}
                                options={sortOptions}
                            />
                        </div>
                        <div className="filters-nat">
                            <div className="filters-nat-title">Nationalities filter</div>
                            <div>
                                {this.nationalitiesCounter()}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={cn('main-right', { 'main-right-grid': !tableView })}>
                    {this.renderUsers()}
                </div>
            </div>
        )
    }
}

export default Contacts;
