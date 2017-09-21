import React, { Component } from 'react';
import logo from './images/glogo.png';
import './App.css';
import Header from './components/Header'
import Footer from './components/Footer'
import ListOfStudents from './components/ListOfStudents'
import StudentModal from './components/StudentModal'
import FilterBar from './components/FilterBar'

const baseURL = 'https://cors-anywhere.herokuapp.com/https://arcane-spire-19269.herokuapp.com'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      students: [],
      selectedStudent: null,
      showModal: false,
      currentFilter: ''
    }
  }

  async componentWillMount() {
    const response = await fetch(`${baseURL}/student`)
    const attendance = await response.json()

    function compare(a, b) {
      if (a.name < b.name)
        return -1
      if (a.name > b.name)
        return 1
      return 0
    }

    let sortedAttendance = attendance.sort(compare)

    this.setState({
      students: sortedAttendance,
      currentFilter: 'all'
    })
  }

  toggleFilter(newFilter) {
    this.setState({ currentFilter: newFilter })
  }

  attendanceSubmission(selectedOption, selectedExcused, studentId) {
    function findId(cohort) {
      return cohort.id === studentId
    }

    let isExcused
    selectedOption ? isExcused = null : isExcused = selectedExcused

    let body = {
      "id": parseInt(this.state.students.find(findId).id, 10),
      "checkedIn": selectedOption,
      "excused": isExcused
    }

    fetch(`${baseURL}/student/update?id=${body.id}&checkedIn=${selectedOption}&excused=${isExcused}`,
      { method: 'PUT' }
    )

    this.setState(prevState => {
      prevState.students.find(findId).checkedIn = selectedOption
      prevState.students.find(findId).excused = isExcused
      prevState.showModal = false
    })
  }

  toggleModal(student) {
    this.state.showModal ?
      this.setState({ showModal: false }) :
      this.setState({ showModal: true,
                      selectedStudent: student
                    })
  }

  render() {
    let students = []
    if (this.state.currentFilter === 'all') {
      students = this.state.students
    } else if (this.state.currentFilter === 'absent') {
      students = this.state.students.filter(student => { return student.checkedIn === false })
    } else if (this.state.currentFilter === 'present') {
      students = this.state.students.filter(student => { return student.checkedIn === true })
    }
    return (
      <div>
        <Header logo={logo}
                instructor="Roberto Ortega"/>
        <div className="content">
        <FilterBar toggleFilter={ this.toggleFilter.bind(this) }/>

        <ListOfStudents students={ students }
                        toggleModal={ this.toggleModal.bind(this) } />

        <StudentModal toggleModal={ this.toggleModal.bind(this) }
                      showModal={ this.state.showModal }
                      student={ this.state.selectedStudent }
                      attendanceSubmission={ this.attendanceSubmission.bind(this) } />
        </div>
        <Footer />
      </div>
    );
  }
}

export default App;
