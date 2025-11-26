import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-group-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './group-info.html',
  styleUrl: './group-info.css'
})
export class GroupInfo {

  group: any;

  attendancePanelOpen = false;
  selectedSession: any = null;

  searchText = ""; // Search in panel
sessionPanelOpen = false;

newSession = {
  title: "",
  day: "",
  time: ""
};
  // ⭐ الطلاب الأساسيين في الكلاس (ثابتين)
  students = [
    "Ahmed Ali",
    "Sara Hassan",
    "Omar Ali",
    "Laila Hassan",
    "Mostafa Amin",
    "Rana Sherif",
    "Maged Yasser",
    "Hala Ali",
    "Karim Samir"
  ];

  // ⭐ جدول السكاشن
  schedule = [
    { 
      id: 1,
      title: "Session 1",
      day: "Monday",
      time: "10:00 AM",
      passed: true,
      present: 4,
      absent: 5,
      presentNames: ["Ahmed Ali", "Sara Hassan", "Omar Ali", "Laila Hassan"],
      absentNames: ["Mostafa Amin", "Rana Sherif", "Maged Yasser", "Hala Ali", "Karim Samir"]
    },
    { 
      id: 2,
      title: "Session 2",
      day: "Wednesday",
      time: "2:00 PM",
      passed: false,
      present: 0,
      absent: 9,
      presentNames: [],
      absentNames: [
        "Ahmed Ali",
        "Sara Hassan",
        "Omar Ali",
        "Laila Hassan",
        "Mostafa Amin",
        "Rana Sherif",
        "Maged Yasser",
        "Hala Ali",
        "Karim Samir"
      ]
    }
  ];

  constructor(private route: ActivatedRoute) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const allGroups = JSON.parse(localStorage.getItem('groupsData') || '[]');
    this.group = allGroups.find((g: any) => g.id === id);
  }

  // فتح panel
  openAttendancePanel(session: any) {
    this.selectedSession = session;
    this.attendancePanelOpen = true;
    this.searchText = "";
  }

  // غلق panel
  closeAttendancePanel() {
    this.attendancePanelOpen = false;
  }

  // ⭐ Search filter
filterNames(list: string[] | null | undefined) {
  if (!list) return []; // يمنع أي error

  return list.filter((n: string) =>
    n.toLowerCase().includes(this.searchText.toLowerCase())
  );
}


  // ⭐ Mark Absent → move from present to absent
  markAbsent(name: string) {
    const s = this.selectedSession;

    s.presentNames = s.presentNames.filter((n: string) => n !== name);
    s.absentNames.push(name);

    s.present = s.presentNames.length;
    s.absent = s.absentNames.length;
  }

  // ⭐ Mark Present → move from absent to present
  markPresent(name: string) {
    const s = this.selectedSession;

    s.absentNames = s.absentNames.filter((n: string) => n !== name);
    s.presentNames.push(name);

    s.present = s.presentNames.length;
    s.absent = s.absentNames.length;
  }
  openNewSessionPanel() {
  this.sessionPanelOpen = true;
  this.newSession = { title: "", day: "", time: "" };
}

closeNewSessionPanel() {
  this.sessionPanelOpen = false;
}

saveNewSession() {
  const id = this.schedule.length + 1;

  this.schedule.push({
    id,
    title: this.newSession.title,
    day: this.newSession.day,
    time: this.newSession.time,
    passed: false,
    present: 0,
    absent: this.students.length, // كلهم غياب أول مرة
    presentNames: [],
    absentNames: [...this.students]
  });

  this.closeNewSessionPanel();

  // optional: save to localStorage
  localStorage.setItem("sessions_" + this.group.id, JSON.stringify(this.schedule));
}
}
