import { CppLesson, CppExample, Project } from '../types/ide';

export const DEFAULT_TEST_PROGRAM = `#include <iostream>
using namespace std;

int main() {
    int a = 25;
    int b = 17;

    cout << "YSUF CODE C++ TEST" << endl;
    cout << "==================" << endl;
    cout << "A = " << a << endl;
    cout << "B = " << b << endl;
    cout << "Sum = " << a + b << endl;
    cout << "Difference = " << a - b << endl;
    cout << "Product = " << a * b << endl;

    return 0;
}
`;

export const PROJECT_TEMPLATES: Array<{
  id: string;
  name: string;
  description: string;
  stdin?: string;
  files: Array<{ name: string; content: string }>;
}> = [
  {
    id: 'console-app',
    name: 'C++ Console App (Барномаи консолӣ)',
    description: 'Барномаи пурраи консолӣ бо санҷиши амалҳои арифметикӣ ва баромади стандартӣ.',
    files: [
      {
        name: 'main.cpp',
        content: DEFAULT_TEST_PROGRAM
      }
    ]
  },
  {
    id: 'hello-world',
    name: 'Hello World (Салом Ҷаҳон)',
    description: 'Барномаи классикии ибтидоӣ барои шиносоӣ бо сохтори C++.',
    files: [
      {
        name: 'main.cpp',
        content: `#include <iostream>
using namespace std;

int main() {
    cout << "Салом аз YUSUF CODE!" << endl;
    cout << "Хуш омадед ба муҳити касбии C++!" << endl;
    return 0;
}
`
      }
    ]
  },
  {
    id: 'calculator',
    name: 'Calculator (Ҳисобкунаки бисёрфайлӣ)',
    description: 'Лоиҳаи дорои main.cpp, utils.h ва utils.cpp барои намоиши компилятсияи бисёрфайлӣ.',
    stdin: '40\n8\n',
    files: [
      {
        name: 'main.cpp',
        content: `#include <iostream>
#include "utils.h"
using namespace std;

int main() {
    int x = 40, y = 8;
    if (!(cin >> x >> y)) {
        x = 40;
        y = 8;
    }

    cout << "=== ҲИСОБКУНАКИ YUSUF CODE ===" << endl;
    cout << "Адади 1: " << x << ", Адади 2: " << y << endl;
    cout << "Ҷамъ: " << calculateSum(x, y) << endl;
    cout << "Тарҳ: " << calculateDiff(x, y) << endl;
    cout << "Зарб: " << calculateProd(x, y) << endl;

    return 0;
}
`
      },
      {
        name: 'utils.h',
        content: `#pragma once

int calculateSum(int a, int b);
int calculateDiff(int a, int b);
int calculateProd(int a, int b);
`
      },
      {
        name: 'utils.cpp',
        content: `#include "utils.h"

int calculateSum(int a, int b) {
    return a + b;
}

int calculateDiff(int a, int b) {
    return a - b;
}

int calculateProd(int a, int b) {
    return a * b;
}
`
      }
    ]
  },
  {
    id: 'student-management',
    name: 'Student Management (Идоракунии донишҷӯён - OOP)',
    description: 'Лоиҳаи OOP бо синфи Student, std::vector ва файлҳои ҷудогонаи сарлавҳа (.h/.cpp).',
    files: [
      {
        name: 'main.cpp',
        content: `#include <iostream>
#include <vector>
#include "student.h"
using namespace std;

int main() {
    vector<Student> group;
    group.push_back(Student("Насим Раҳимов", 19, 95.5));
    group.push_back(Student("Мадина Каримова", 20, 98.0));
    group.push_back(Student("Юсуф Собиров", 19, 99.2));

    cout << "Рӯйхати донишҷӯёни фаъол:" << endl;
    cout << "------------------------------------" << endl;

    for (size_t i = 0; i < group.size(); ++i) {
        group[i].print();
    }

    return 0;
}
`
      },
      {
        name: 'student.h',
        content: `#pragma once
#include <string>

class Student {
public:
    std::string name;
    int age;
    double gpa;

    Student(std::string n, int a, double g);
    void print() const;
};
`
      },
      {
        name: 'student.cpp',
        content: `#include <iostream>
#include "student.h"
using namespace std;

Student::Student(string n, int a, double g)
    : name(n), age(a), gpa(g) {}

void Student::print() const {
    cout << "Ном: " << name
         << " | Синну сол: " << age
         << " | Хол: " << gpa << endl;
}
`
      }
    ]
  },
  {
    id: 'empty-project',
    name: 'Empty C++ Project (Лоиҳаи холӣ)',
    description: 'Файли тозаи main.cpp барои оғози кодгузорӣ аз сифр.',
    files: [
      {
        name: 'main.cpp',
        content: `#include <iostream>

int main() {
    
    return 0;
}
`
      }
    ]
  }
];

export const CPP_LESSONS: CppLesson[] = [
  {
    id: 'lesson-1',
    number: 1,
    title: 'Муқаддима ба C++',
    category: 'Асосҳо',
    explanation: 'C++ яке аз забонҳои пуриқтидортарин ва зудтарини барномасозӣ дар ҷаҳон мебошад. Ҳар як барномаи C++ аз функсияи асосии int main() оғоз меёбад ва барои кор бо воридот ва баромад китобхонаи #include <iostream>-ро истифода мебарад.',
    keyPoints: [
      '#include <iostream> китобхонаи стандартии вуруд ва баромадро ҳамроҳ мекунад',
      'Функсияи int main() нуқтаи оғози иҷрои барнома мебошад',
      'std::cout барои чопи матн дар экран истифода мешавад',
      'Ҳар як фармон дар C++ бо аломати нуқта-вергул (;) ба охир мерасад'
    ],
    exampleCode: `#include <iostream>
using namespace std;

int main() {
    cout << "Салом, C++!" << endl;
    cout << "Ман дар YUSUF CODE барнома менависам." << endl;
    return 0;
}`,
    expectedOutput: `Салом, C++!\nМан дар YUSUF CODE барнома менависам.`,
    exercisePrompt: 'Барномае нависед, ки дар экран ҷумлаи "YUSUF CODE C++" чоп кунад.',
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // Коди худро дар ин ҷо нависед
    cout << "YUSUF CODE C++" << endl;
    return 0;
}`,
    expectedExerciseOutput: 'YUSUF CODE C++'
  },
  {
    id: 'lesson-2',
    number: 2,
    title: 'Тағйирёбандаҳо (Variables)',
    category: 'Асосҳо',
    explanation: 'Тағйирёбанда ячейкаи номгузоришуда дар ҳофизаи компютер аст, ки қимати муайянро нигоҳ медорад. Пеш аз истифодаи тағйирёбанда дар C++ навъ ва номи он эълон карда мешавад.',
    keyPoints: [
      'Синтаксис: навъ ном = қимат; (масалан: int age = 19;)',
      'Номи тағйирёбанда бояд бо ҳарф ё аломати _ оғоз шавад',
      'Қимати тағйирёбандаро дар рафти барнома иваз кардан мумкин аст'
    ],
    exampleCode: `#include <iostream>
using namespace std;

int main() {
    int year = 2026;
    int students = 30;
    cout << "Сол: " << year << endl;
    cout << "Шумораи донишҷӯён: " << students << endl;
    return 0;
}`,
    expectedOutput: `Сол: 2026\nШумораи донишҷӯён: 30`,
    exercisePrompt: 'Тағйирёбандаи int x = 50 ва int y = 25 созед ва суммаи онҳоро (75) чоп кунед.',
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int x = 50;
    int y = 25;
    cout << x + y << endl;
    return 0;
}`,
    expectedExerciseOutput: '75'
  },
  {
    id: 'lesson-3',
    number: 3,
    title: 'Навъҳои маълумот (Data Types)',
    category: 'Асосҳо',
    explanation: 'Дар C++ навъҳои асосии маълумот барои ададҳои бутун (int, long long), ададҳои касрӣ (double, float), аломатҳои якгона (char) ва қиматҳои мантиқӣ (bool) мавҷуданд.',
    keyPoints: [
      'int — ададҳои бутун (масалан: 42, -10)',
      'double — ададҳои ҳақиқӣ бо дақиқии баланд (масалан: 3.14159)',
      'char — як аломат дар нохунакҳои якгона (масалан: \'A\')',
      'bool — қимати мантиқӣ: true (1) ё false (0)'
    ],
    exampleCode: `#include <iostream>
using namespace std;

int main() {
    int count = 12;
    double price = 19.95;
    char grade = 'A';
    bool isPassed = true;

    cout << "Миқдор: " << count << endl;
    cout << "Нарх: " << price << endl;
    cout << "Баҳо: " << grade << endl;
    cout << "Гузашт: " << isPassed << endl;
    return 0;
}`,
    expectedOutput: `Миқдор: 12\nНарх: 19.95\nБаҳо: A\nГузашт: 1`,
    exercisePrompt: 'Тағйирёбандаи double pi = 3.14 эълон кунед ва қимати онро чоп намоед.',
    starterCode: `#include <iostream>
using namespace std;

int main() {
    double pi = 3.14;
    cout << pi << endl;
    return 0;
}`,
    expectedExerciseOutput: '3.14'
  },
  {
    id: 'lesson-4',
    number: 4,
    title: 'Вуруд ва натиҷа (std::cin / std::cout)',
    category: 'Асосҳо',
    explanation: 'Барои қабули маълумот аз истифодабаранда (stdin) объекти std::cin бо оператори >> истифода мешавад. Дар YUSUF CODE шумо метавонед қиматҳоро дар равзанаи "Вуруд" нависед.',
    keyPoints: [
      'cin >> x; қиматро аз вуруд мехонад',
      'Якчанд қиматро паиҳам хондан мумкин аст: cin >> a >> b;',
      'Барои хондани сатри пурра бо фосилаҳо getline(cin, str) истифода мешавад'
    ],
    exampleCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string name = "Насим";
    int age = 19;
    cin >> name >> age;
    cout << "Салом " << name << ", синну соли шумо: " << age << endl;
    return 0;
}`,
    expectedOutput: `Салом Насим, синну соли шумо: 19`,
    exercisePrompt: 'Барномае нависед, ки ду ададро аз std::cin гирифта, ҷамъи онҳоро нишон диҳад (барои вуруди 15 ва 27 натиҷа 42 мешавад).',
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    if (cin >> a >> b) {
        cout << a + b << endl;
    }
    return 0;
}`,
    stdinForTest: '15\n27\n',
    expectedExerciseOutput: '42'
  },
  {
    id: 'lesson-5',
    number: 5,
    title: 'Оператори шартии if / else',
    category: 'Идоракунии ҷараён',
    explanation: 'Сохтори if / else имкон медиҳад, ки барнома вобаста ба дуруст ё нодуруст будани шарт қарор қабул кунад.',
    keyPoints: [
      'Операторҳои муқоисавӣ: ==, !=, >, <, >=, <=',
      'Операторҳои мантиқӣ: && (ВА), || (Ё), ! (НЕ)',
      'else if барои санҷиши якчанд шартҳои пайдарпай хизмат мекунад'
    ],
    exampleCode: `#include <iostream>
using namespace std;

int main() {
    int score = 88;
    if (score >= 90) {
        cout << "Баҳо: Аъло" << endl;
    } else if (score >= 75) {
        cout << "Баҳо: Хуб" << endl;
    } else {
        cout << "Баҳо: Қаноатбахш" << endl;
    }
    return 0;
}`,
    expectedOutput: `Баҳо: Хуб`,
    exercisePrompt: 'Агар адади n = 10 ҷуфт бошад (n % 2 == 0), дар экран "EVEN" чоп кунед.',
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int n = 10;
    if (n % 2 == 0) {
        cout << "EVEN" << endl;
    } else {
        cout << "ODD" << endl;
    }
    return 0;
}`,
    expectedExerciseOutput: 'EVEN'
  },
  {
    id: 'lesson-6',
    number: 6,
    title: 'Даври for',
    category: 'Идоракунии ҷараён',
    explanation: 'Даври for барои такрори маҷмӯи фармонҳо ба миқдори муайяни маротиба истифода мешавад.',
    keyPoints: [
      'Сохтор: for (оғоз; шарт; қадам) { ... }',
      'i++ қимати тағйирёбандаро ба 1 воҳид зиёд мекунад',
      'break даврро пеш аз муҳлат қатъ мекунад'
    ],
    exampleCode: `#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 5; i++) {
        cout << "Қадами " << i << endl;
    }
    return 0;
}`,
    expectedOutput: `Қадами 1\nҚадами 2\nҚадами 3\nҚадами 4\nҚадами 5`,
    exercisePrompt: 'Бо истифодаи даври for суммаи ададҳоро аз 1 то 5 ҳисоб карда чоп кунед (15).',
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int sum = 0;
    for (int i = 1; i <= 5; i++) {
        sum += i;
    }
    cout << sum << endl;
    return 0;
}`,
    expectedExerciseOutput: '15'
  },
  {
    id: 'lesson-7',
    number: 7,
    title: 'Даври while',
    category: 'Идоракунии ҷараён',
    explanation: 'Даври while блокҳои кодро то даме ки шарти додашуда дуруст (true) аст, такрор мекунад.',
    keyPoints: [
      'Шарт пеш аз ҳар як такрор санҷида мешавад',
      'Ҳатман тағйирёбандаи шартро дар дохили давр тағйир диҳед, то даври беохир нашавад',
      'do-while ақаллан як маротиба иҷро мешавад'
    ],
    exampleCode: `#include <iostream>
using namespace std;

int main() {
    int n = 3;
    while (n > 0) {
        cout << n << "... ";
        n--;
    }
    cout << "Оғоз!" << endl;
    return 0;
}`,
    expectedOutput: `3... 2... 1... Оғоз!`,
    exercisePrompt: 'Бо истифодаи while ададҳои 2, 4, 6-ро дар як сатр бо фосила чоп кунед ("2 4 6").',
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int x = 2;
    while (x <= 6) {
        cout << x << (x < 6 ? " " : "");
        x += 2;
    }
    cout << endl;
    return 0;
}`,
    expectedExerciseOutput: '2 4 6'
  },
  {
    id: 'lesson-8',
    number: 8,
    title: 'Массивҳо (Arrays)',
    category: 'Сохторҳои маълумот',
    explanation: 'Массив маҷмӯи элементҳои якхела мебошад, ки дар ҳофиза пайдарпай ҷойгир шудаанд. Индексатсия дар C++ ҳамеша аз 0 оғоз меёбад.',
    keyPoints: [
      'Эълон: int arr[5] = {10, 20, 30, 40, 50};',
      'Элементи якум: arr[0], элементи охирин: arr[n-1]',
      'Бо даври for ҳамаи элементҳои массивро коркард мекунанд'
    ],
    exampleCode: `#include <iostream>
using namespace std;

int main() {
    int nums[4] = {5, 10, 15, 20};
    int total = 0;
    for (int i = 0; i < 4; i++) {
        total += nums[i];
    }
    cout << "Суммаи массив: " << total << endl;
    return 0;
}`,
    expectedOutput: `Суммаи массив: 50`,
    exercisePrompt: 'Дар массиви {12, 45, 23, 89, 34} калонтарин ададро (89) ёфта чоп кунед.',
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int a[5] = {12, 45, 23, 89, 34};
    int maxVal = a[0];
    for (int i = 1; i < 5; i++) {
        if (a[i] > maxVal) maxVal = a[i];
    }
    cout << maxVal << endl;
    return 0;
}`,
    expectedExerciseOutput: '89'
  },
  {
    id: 'lesson-9',
    number: 9,
    title: 'Сатрҳо (std::string)',
    category: 'Сохторҳои маълумот',
    explanation: 'Синфи std::string имкониятҳои васеъро барои кор бо матнҳо фароҳам меорад: пайвасткунӣ (+), гирифтани дарозӣ (.length() ё .size()), ҷустуҷӯ (.find()) ва буридани зерсатр (.substr()).',
    keyPoints: [
      '#include <string>-ро ба барнома илова кунед',
      'str.length() шумораи аломатҳоро бармегардонад',
      'str.substr(pos, count) қисми сатрро ҷудо мекунад'
    ],
    exampleCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string city = "Dushanbe";
    cout << "Шаҳр: " << city << endl;
    cout << "Дарозӣ: " << city.length() << endl;
    cout << "Зерсатр: " << city.substr(0, 4) << endl;
    return 0;
}`,
    expectedOutput: `Шаҳр: Dushanbe\nДарозӣ: 8\nЗерсатр: Dush`,
    exercisePrompt: 'Ду сатри "YUSUF" ва " CODE"-ро пайваст карда, дарозии сатри ҳосилшударо (10) чоп кунед.',
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s = string("YUSUF") + " CODE";
    cout << s.length() << endl;
    return 0;
}`,
    expectedExerciseOutput: '10'
  },
  {
    id: 'lesson-10',
    number: 10,
    title: 'Функсияҳо (Functions)',
    category: 'Сохтори барнома',
    explanation: 'Функсияҳо имкон медиҳанд, ки код ба қисмҳои мантиқӣ ва такроран истифодашаванда тақсим карда шавад.',
    keyPoints: [
      'Функсия дорои навъи бозгашт, ном ва рӯйхати параметрҳо мебошад',
      'return қиматро ба ҷои даъвати функсия бармегардонад',
      'Функсияҳои void қимат барнамегардонанд'
    ],
    exampleCode: `#include <iostream>
using namespace std;

int square(int x) {
    return x * x;
}

int main() {
    cout << "Квадрати 9 = " << square(9) << endl;
    return 0;
}`,
    expectedOutput: `Квадрати 9 = 81`,
    exercisePrompt: 'Функсияи multiply(int a, int b) нависед ва ҳосили зарби 7 ва 8-ро (56) чоп кунед.',
    starterCode: `#include <iostream>
using namespace std;

int multiply(int a, int b) {
    return a * b;
}

int main() {
    cout << multiply(7, 8) << endl;
    return 0;
}`,
    expectedExerciseOutput: '56'
  },
  {
    id: 'lesson-11',
    number: 11,
    title: 'Синфҳо (Classes)',
    category: 'OOP',
    explanation: 'Синф (class) нақша ё қолаб барои сохтани объектҳо мебошад. Он маълумот (майдонҳо) ва функсияҳоро (методҳо) дар як сохтор муттаҳид мекунад.',
    keyPoints: [
      'Калимаи калидии public дастрасии берунаро иҷозат медиҳад',
      'Конструктор ҳангоми сохтани объект худкор даъват мешавад',
      'Ба аъзоёни объект тавассути нуқта (obj.method()) муроҷиат мекунанд'
    ],
    exampleCode: `#include <iostream>
#include <string>
using namespace std;

class Book {
public:
    string title;
    int pages;

    void info() {
        cout << title << " (" << pages << " саҳифа)" << endl;
    }
};

int main() {
    Book b;
    b.title = "Барномасозии C++";
    b.pages = 320;
    b.info();
    return 0;
}`,
    expectedOutput: `Барномасозии C++ (320 саҳифа)`,
    exercisePrompt: 'Синфи Box бо майдонҳои width = 4 ва height = 5 созед ва масоҳати онро (20) чоп кунед.',
    starterCode: `#include <iostream>
using namespace std;

class Box {
public:
    int width;
    int height;
    int area() { return width * height; }
};

int main() {
    Box box{4, 5};
    cout << box.area() << endl;
    return 0;
}`,
    expectedExerciseOutput: '20'
  },
  {
    id: 'lesson-12',
    number: 12,
    title: 'Барномасозии ба объект нигаронидашуда (OOP)',
    category: 'OOP',
    explanation: 'OOP ба чор принсипи асосӣ такя мекунад: Инкапсулятсия (пинҳонкунии маълумот бо private), Меросбарӣ (inheritance), Полиморфизм (virtual/override) ва Абстраксия.',
    keyPoints: [
      'private майдонҳоро аз тағйири тасодуфӣ муҳофизат мекунад',
      'class Child : public Parent меросбариро ифода мекунад',
      'virtual барои бозсозии методҳо дар синфҳои фарзандӣ истифода мешавад'
    ],
    exampleCode: `#include <iostream>
using namespace std;

class Animal {
public:
    virtual void speak() {
        cout << "Садо..." << endl;
    }
};

class Eagle : public Animal {
public:
    void speak() override {
        cout << "Уқоб дар парвоз аст!" << endl;
    }
};

int main() {
    Eagle e;
    e.speak();
    return 0;
}`,
    expectedOutput: `Уқоб дар парвоз аст!`,
    exercisePrompt: 'Методи getBalance()-ро дар синфи BankAccount иҷро карда, қимати 1500-ро чоп кунед.',
    starterCode: `#include <iostream>
using namespace std;

class BankAccount {
private:
    int balance = 1500;
public:
    int getBalance() const { return balance; }
};

int main() {
    BankAccount acc;
    cout << acc.getBalance() << endl;
    return 0;
}`,
    expectedExerciseOutput: '1500'
  },
  {
    id: 'lesson-13',
    number: 13,
    title: 'Контейнери std::vector',
    category: 'STL',
    explanation: 'std::vector қулайтарин контейнери STL дар C++ мебошад. Он массиви динамикӣ аст, ки бо методи push_back() васеъ мешавад ва андозаи худро дар size() нигоҳ медорад.',
    keyPoints: [
      '#include <vector> лозим аст',
      'v.push_back(x) элементро ба охир илова мекунад',
      'v.size() шумораи элементҳоро медиҳад'
    ],
    exampleCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> v = {10, 20, 30};
    v.push_back(40);

    cout << "Андоза: " << v.size() << endl;
    for (int x : v) {
        cout << x << " ";
    }
    cout << endl;
    return 0;
}`,
    expectedOutput: `Андоза: 4\n10 20 30 40 `,
    exercisePrompt: 'Ба вектори холӣ ададҳои 3, 6, 9-ро бо push_back илова кунед ва андозаи векторро (3) чоп кунед.',
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> v;
    v.push_back(3);
    v.push_back(6);
    v.push_back(9);
    cout << v.size() << endl;
    return 0;
}`,
    expectedExerciseOutput: '3'
  },
  {
    id: 'lesson-14',
    number: 14,
    title: 'Луғати std::map',
    category: 'STL',
    explanation: 'std::map маълумотро дар шакли ҷуфти "калид -> қимат" (key-value) нигоҳ медорад ва калидҳоро худкор ба тартиб медарорад.',
    keyPoints: [
      '#include <map> истифода мешавад',
      'Дастрасӣ ва сабт тавассути қавсҳои мураббаъ: m["key"] = value;',
      'Ҳар як элемент дорои p.first (калид) ва p.second (қимат) аст'
    ],
    exampleCode: `#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    map<string, int> grades;
    grades["Насим"] = 95;
    grades["Юсуф"] = 100;

    for (const auto& pair : grades) {
        cout << pair.first << ": " << pair.second << endl;
    }
    return 0;
}`,
    expectedOutput: `Насим: 95\nЮсуф: 100`,
    exercisePrompt: 'Дар map калиди "CPP"-ро бо қимати 2017 сабт кунед ва қимати онро чоп намоед.',
    starterCode: `#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    map<string, int> m;
    m["CPP"] = 2017;
    cout << m["CPP"] << endl;
    return 0;
}`,
    expectedExerciseOutput: '2017'
  },
  {
    id: 'lesson-15',
    number: 15,
    title: 'Ишорагарҳо (Pointers)',
    category: 'Ҳофиза',
    explanation: 'Ишорагар (pointer) тағйирёбандаест, ки суроғаи ячейкаи ҳофизаи тағйирёбандаи дигарро нигоҳ медорад.',
    keyPoints: [
      '&x — гирифтани суроғаи тағйирёбандаи x',
      'int* ptr = &x; — эълони ишорагар',
      '*ptr — гирифтани қимат аз суроға (dereference)'
    ],
    exampleCode: `#include <iostream>
using namespace std;

int main() {
    int number = 42;
    int* ptr = &number;

    cout << "Қимат тавассути *ptr: " << *ptr << endl;
    *ptr = 99;
    cout << "Қимати нави number: " << number << endl;
    return 0;
}`,
    expectedOutput: `Қимат тавассути *ptr: 42\nҚимати нави number: 99`,
    exercisePrompt: 'Тавассути ишорагар қимати тағйирёбандаи a = 10-ро ба 200 тағйир диҳед ва a-ро чоп кунед.',
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int a = 10;
    int* p = &a;
    *p = 200;
    cout << a << endl;
    return 0;
}`,
    expectedExerciseOutput: '200'
  },
  {
    id: 'lesson-16',
    number: 16,
    title: 'Истинодҳо (References)',
    category: 'Ҳофиза',
    explanation: 'Истинод (reference) номи дуюм (алтернативӣ) барои тағйирёбандаи мавҷуда мебошад. Он дар параметрҳои функсия барои пешгирии нусхабардории зиёдатӣ васеъ истифода мешавад.',
    keyPoints: [
      'int& ref = original; — эҷоди истинод',
      'Тағйир додани ref бевосита original-ро тағйир медиҳад',
      'const string& дар функсияҳо суръати корро зиёд мекунад'
    ],
    exampleCode: `#include <iostream>
using namespace std;

void addTen(int& val) {
    val += 10;
}

int main() {
    int score = 85;
    addTen(score);
    cout << "Натиҷа: " << score << endl;
    return 0;
}`,
    expectedOutput: `Натиҷа: 95`,
    exercisePrompt: 'Функсияи swapValues(int& a, int& b) истифода бурда, 5 ва 9-ро ҷойиваз кунед ва "9 5" чоп намоед.',
    starterCode: `#include <iostream>
using namespace std;

void swapValues(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}

int main() {
    int x = 5, y = 9;
    swapValues(x, y);
    cout << x << " " << y << endl;
    return 0;
}`,
    expectedExerciseOutput: '9 5'
  },
  {
    id: 'lesson-17',
    number: 17,
    title: 'Қолабҳо (Templates)',
    category: 'Пешрафта',
    explanation: 'Қолабҳо (templates) имкон медиҳанд, ки функсияҳо ва синфҳои универсалӣ навишта шаванд, ки бо дилхоҳ навъи маълумот (int, double, string) кор карда метавонанд.',
    keyPoints: [
      'template <typename T> пеш аз функсия ё синф навишта мешавад',
      'Компилятор худкор версияи лозимаи функсияро барои ҳар як навъ месозад',
      'Тамоми китобхонаи STL (vector, map, sort) дар асоси қолабҳо сохта шудааст'
    ],
    exampleCode: `#include <iostream>
using namespace std;

template <typename T>
T getMax(T a, T b) {
    return (a > b) ? a : b;
}

int main() {
    cout << "Max int: " << getMax(14, 28) << endl;
    cout << "Max double: " << getMax(3.14, 2.71) << endl;
    return 0;
}`,
    expectedOutput: `Max int: 28\nMax double: 3.14`,
    exercisePrompt: 'Функсияи қолабии addValues<T>(T a, T b) созед ва суммаи 12.5 ва 7.5-ро (20) чоп кунед.',
    starterCode: `#include <iostream>
using namespace std;

template <typename T>
T addValues(T a, T b) {
    return a + b;
}

int main() {
    cout << addValues(12.5, 7.5) << endl;
    return 0;
}`,
    expectedExerciseOutput: '20'
  }
];

export const CPP_EXAMPLES: CppExample[] = [
  {
    id: 'ex-test',
    title: 'YSUF CODE C++ TEST',
    description: 'Барномаи стандартии санҷиши амалҳои арифметикӣ.',
    category: 'Асосҳо',
    files: [{ name: 'main.cpp', content: DEFAULT_TEST_PROGRAM }]
  },
  {
    id: 'ex-hello',
    title: 'Hello World',
    description: 'Аввалин барнома дар C++ бо std::cout.',
    category: 'Асосҳо',
    files: [
      {
        name: 'main.cpp',
        content: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello World! Салом аз YUSUF CODE!" << endl;
    return 0;
}`
      }
    ]
  },
  {
    id: 'ex-input',
    title: 'User Input (Вуруди маълумот)',
    description: 'Хондани ном ва синну сол аз равзанаи Вуруд (stdin).',
    category: 'Асосҳо',
    stdin: 'Насим\n19\n',
    files: [
      {
        name: 'main.cpp',
        content: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string name;
    int age;

    if (cin >> name >> age) {
        cout << "Корбар: " << name << endl;
        cout << "Синну сол: " << age << endl;
        cout << "Соли таваллуд (тақрибан): " << (2026 - age) << endl;
    } else {
        cout << "Лутфан дар равзанаи Вуруд ном ва синну солро нависед." << endl;
    }
    return 0;
}`
      }
    ]
  },
  {
    id: 'ex-vector-sort',
    title: 'Vector & Sort (Мураттабсозии вектор)',
    description: 'Истифодаи std::vector ва алгоритми std::sort.',
    category: 'STL',
    files: [
      {
        name: 'main.cpp',
        content: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> numbers = {42, 7, 19, 88, 3, 25, 14};

    sort(numbers.begin(), numbers.end());

    cout << "Ададҳои мураттабшуда: ";
    for (int n : numbers) {
        cout << n << " ";
    }
    cout << endl;
    cout << "Хурдтарин: " << numbers.front() << endl;
    cout << "Калонтарин: " << numbers.back() << endl;
    return 0;
}`
      }
    ]
  },
  {
    id: 'ex-multifile',
    title: 'File Structure (Лоиҳаи бисёрфайлӣ)',
    description: 'Намунаи лоиҳа бо main.cpp, math_utils.h ва math_utils.cpp.',
    category: 'Лоиҳа',
    files: PROJECT_TEMPLATES[2].files
  }
];

export function createInitialProjects(): Project[] {
  const now = Date.now();
  return [
    {
      id: 'proj-default-test',
      name: 'My First Project',
      description: 'Барномаи санҷишии YSUF CODE C++ TEST',
      templateId: 'console-app',
      createdAt: now - 3600_000 * 12,
      updatedAt: now - 60_000 * 5,
      stdin: 'Насим\n19\n',
      files: [
        {
          id: 'file-main-1',
          name: 'main.cpp',
          path: 'main.cpp',
          language: 'cpp',
          content: DEFAULT_TEST_PROGRAM,
          updatedAt: now
        }
      ]
    },
    {
      id: 'proj-calculator',
      name: 'Calculator',
      description: 'Ҳисобкунаки бисёрфайлӣ бо main.cpp, utils.h ва utils.cpp',
      templateId: 'calculator',
      createdAt: now - 3600_000 * 24,
      updatedAt: now - 3600_000 * 2,
      stdin: '40\n8\n',
      files: PROJECT_TEMPLATES[2].files.map((f, idx) => ({
        id: `file-calc-${idx}`,
        name: f.name,
        path: f.name,
        language: f.name.endsWith('.h') ? 'h' : 'cpp',
        content: f.content,
        updatedAt: now
      }))
    },
    {
      id: 'proj-student-mgmt',
      name: 'Student Management',
      description: 'Низомномаи донишҷӯён дар асоси синфҳо (OOP)',
      templateId: 'student-management',
      createdAt: now - 3600_000 * 48,
      updatedAt: now - 3600_000 * 6,
      stdin: '',
      files: PROJECT_TEMPLATES[3].files.map((f, idx) => ({
        id: `file-stud-${idx}`,
        name: f.name,
        path: f.name,
        language: f.name.endsWith('.h') ? 'h' : 'cpp',
        content: f.content,
        updatedAt: now
      }))
    }
  ];
}
