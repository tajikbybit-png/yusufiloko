import { AutocompleteItem } from '../types/ide';

export const CPP_KEYWORDS: string[] = [
  'int', 'double', 'float', 'char', 'bool', 'void', 'auto', 'long', 'short', 'unsigned', 'signed',
  'const', 'constexpr', 'static', 'extern', 'mutable', 'volatile', 'inline',
  'class', 'struct', 'union', 'enum', 'public', 'private', 'protected', 'friend', 'virtual', 'override', 'final',
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'return', 'goto',
  'new', 'delete', 'this', 'nullptr', 'true', 'false',
  'try', 'catch', 'throw', 'noexcept',
  'namespace', 'using', 'typedef', 'template', 'typename', 'sizeof', 'static_cast', 'dynamic_cast', 'const_cast', 'reinterpret_cast'
];

export const STD_NAMESPACE_ITEMS: AutocompleteItem[] = [
  {
    label: 'cout',
    insertText: 'cout',
    kind: 'variable',
    detail: 'std::ostream std::cout',
    documentation: 'Ҷараёни стандартии баромад ( консол ). Барои чопи маълумот бо оператори << истифода мешавад.',
    priority: 95
  },
  {
    label: 'cin',
    insertText: 'cin',
    kind: 'variable',
    detail: 'std::istream std::cin',
    documentation: 'Ҷараёни стандартии вуруд. Барои хондани маълумот аз клавиатура бо оператори >> истифода мешавад.',
    priority: 95
  },
  {
    label: 'endl',
    insertText: 'endl',
    kind: 'function',
    detail: 'std::ostream& endl(std::ostream& os)',
    documentation: 'Гузариш ба сатри нав ва тоза кардани буфери баромад (flush).',
    priority: 94
  },
  {
    label: 'cerr',
    insertText: 'cerr',
    kind: 'variable',
    detail: 'std::ostream std::cerr',
    documentation: 'Ҷараёни стандартии баромади хатоҳо.',
    priority: 85
  },
  {
    label: 'clog',
    insertText: 'clog',
    kind: 'variable',
    detail: 'std::ostream std::clog',
    documentation: 'Ҷараёни стандартии сабти гузоришҳо (логҳо).',
    priority: 82
  },
  {
    label: 'string',
    insertText: 'string',
    kind: 'class',
    detail: 'class std::basic_string<char>',
    documentation: 'Синфи стандартӣ барои кор бо сатрҳои матнӣ дар C++.',
    priority: 96
  },
  {
    label: 'vector',
    insertText: 'vector<int>',
    kind: 'class',
    detail: 'template<class T> class std::vector',
    documentation: 'Массиви динамикӣ, ки андозааш худкор тағйир меёбад.',
    cursorOffset: -1,
    priority: 96
  },
  {
    label: 'map',
    insertText: 'map<string, int>',
    kind: 'class',
    detail: 'template<class Key, class T> class std::map',
    documentation: 'Контейнери ассотсиативӣ, ки ҷуфтҳои калид-қиматро (key-value) ба тартиб нигоҳ медорад.',
    priority: 92
  },
  {
    label: 'set',
    insertText: 'set<int>',
    kind: 'class',
    detail: 'template<class Key> class std::set',
    documentation: 'Маҷмӯи элементҳои бетакрор, ки ба тартиб нигоҳ дошта мешаванд.',
    priority: 90
  },
  {
    label: 'array',
    insertText: 'array<int, 5>',
    kind: 'class',
    detail: 'template<class T, size_t N> struct std::array',
    documentation: 'Контейнери массиви андозааш доимӣ.',
    priority: 88
  },
  {
    label: 'pair',
    insertText: 'pair<int, int>',
    kind: 'class',
    detail: 'template<class T1, class T2> struct std::pair',
    documentation: 'Сохтор барои нигоҳ доштани ду қимати гуногун дар як ҷуфт.',
    priority: 89
  },
  {
    label: 'sort',
    insertText: 'sort(v.begin(), v.end())',
    kind: 'function',
    detail: 'void std::sort(RandomIt first, RandomIt last)',
    documentation: 'Ҷобаҷогузории (мураттабсозии) элементҳо дар диапазон бо тартиби афзоиш.',
    signature: 'void sort(RandomIt first, RandomIt last)',
    priority: 93
  },
  {
    label: 'max',
    insertText: 'max(a, b)',
    kind: 'function',
    detail: 'const T& std::max(const T& a, const T& b)',
    documentation: 'Калонтарин аз ду қиматро бармегардонад.',
    signature: 'const T& max(const T& a, const T& b)',
    priority: 91
  },
  {
    label: 'min',
    insertText: 'min(a, b)',
    kind: 'function',
    detail: 'const T& std::min(const T& a, const T& b)',
    documentation: 'Хурдтарин аз ду қиматро бармегардонад.',
    signature: 'const T& min(const T& a, const T& b)',
    priority: 91
  },
  {
    label: 'getline',
    insertText: 'getline(cin, str)',
    kind: 'function',
    detail: 'istream& std::getline(istream& is, string& str)',
    documentation: 'Хондани сатри пурра бо фосилаҳо аз ҷараёни вуруд.',
    signature: 'istream& getline(istream& input, string& str)',
    priority: 92
  },
  {
    label: 'swap',
    insertText: 'swap(a, b)',
    kind: 'function',
    detail: 'void std::swap(T& a, T& b)',
    documentation: 'Иваз кардани қиматҳои ду тағйирёбанда.',
    signature: 'void swap(T& a, T& b)',
    priority: 87
  },
  {
    label: 'to_string',
    insertText: 'to_string(val)',
    kind: 'function',
    detail: 'std::string std::to_string(int val)',
    documentation: 'Табдил додани адад ба сатри std::string.',
    signature: 'string to_string(numeric value)',
    priority: 88
  },
  {
    label: 'variant',
    insertText: 'variant<int, string>',
    kind: 'class',
    detail: 'template<class... Types> class std::variant (C++17)',
    documentation: 'Иттиҳодияи бехатари навъҳо (type-safe union) дар стандарти C++17.',
    priority: 84
  },
  {
    label: 'visit',
    insertText: 'visit(visitor, vars)',
    kind: 'function',
    detail: 'constexpr decltype(auto) std::visit(Visitor&& vis, Variants&&... vars)',
    documentation: 'Татбиқи функсия ба қимати нигоҳдошташудаи std::variant.',
    priority: 83
  }
];

export const STRING_METHODS: AutocompleteItem[] = [
  {
    label: 'length()',
    insertText: 'length()',
    kind: 'method',
    detail: 'size_t std::string::length() const',
    documentation: 'Дарозии сатрро (шумораи аломатҳо) бармегардонад.',
    signature: 'size_t length() const noexcept',
    priority: 98
  },
  {
    label: 'size()',
    insertText: 'size()',
    kind: 'method',
    detail: 'size_t std::string::size() const',
    documentation: 'Шумораи аломатҳои сатрро бармегардонад (баробар ба length()).',
    signature: 'size_t size() const noexcept',
    priority: 98
  },
  {
    label: 'empty()',
    insertText: 'empty()',
    kind: 'method',
    detail: 'bool std::string::empty() const',
    documentation: 'Месанҷад, ки оё сатр холӣ аст (true ё false).',
    signature: 'bool empty() const noexcept',
    priority: 96
  },
  {
    label: 'substr()',
    insertText: 'substr(0, 5)',
    kind: 'method',
    detail: 'string std::string::substr(size_t pos = 0, size_t count = npos) const',
    documentation: 'Зерсатрро аз мавқеи pos ба андозаи count аломат бармегардонад.',
    signature: 'string substr(size_t pos, size_t count) const',
    priority: 95
  },
  {
    label: 'find()',
    insertText: 'find("")',
    kind: 'method',
    detail: 'size_t std::string::find(const string& str, size_t pos = 0) const',
    documentation: 'Мавқеи аввалин пайдоиши зерсатрро меёбад.',
    signature: 'size_t find(const string& str, size_t pos = 0) const',
    cursorOffset: -2,
    priority: 94
  },
  {
    label: 'compare()',
    insertText: 'compare(other)',
    kind: 'method',
    detail: 'int std::string::compare(const string& str) const',
    documentation: 'Ду сатрро муқоиса мекунад (0 агар баробар бошанд).',
    signature: 'int compare(const string& str) const noexcept',
    priority: 90
  },
  {
    label: 'append()',
    insertText: 'append("")',
    kind: 'method',
    detail: 'string& std::string::append(const string& str)',
    documentation: 'Матни навро ба охири сатр илова мекунад.',
    signature: 'string& append(const string& str)',
    cursorOffset: -2,
    priority: 92
  },
  {
    label: 'replace()',
    insertText: 'replace(0, 1, "")',
    kind: 'method',
    detail: 'string& std::string::replace(size_t pos, size_t count, const string& str)',
    documentation: 'Қисми сатрро бо матни нав иваз мекунад.',
    signature: 'string& replace(size_t pos, size_t count, const string& str)',
    priority: 89
  },
  {
    label: 'c_str()',
    insertText: 'c_str()',
    kind: 'method',
    detail: 'const char* std::string::c_str() const',
    documentation: 'Ишорагар (pointer) ба массиви C-сатрро бармегардонад.',
    signature: 'const char* c_str() const noexcept',
    priority: 88
  },
  {
    label: 'clear()',
    insertText: 'clear()',
    kind: 'method',
    detail: 'void std::string::clear()',
    documentation: 'Ҳамаи аломатҳои сатрро нест мекунад.',
    signature: 'void clear() noexcept',
    priority: 91
  }
];

export const VECTOR_METHODS: AutocompleteItem[] = [
  {
    label: 'size()',
    insertText: 'size()',
    kind: 'method',
    detail: 'size_t std::vector<T>::size() const',
    documentation: 'Шумораи элементҳои мавҷудаи векторро бармегардонад.',
    signature: 'size_t size() const noexcept',
    priority: 99
  },
  {
    label: 'push_back()',
    insertText: 'push_back()',
    kind: 'method',
    detail: 'void std::vector<T>::push_back(const T& value)',
    documentation: 'Элементи навро ба охири вектор илова мекунад.',
    signature: 'void push_back(const T& value)',
    cursorOffset: -1,
    priority: 99
  },
  {
    label: 'pop_back()',
    insertText: 'pop_back()',
    kind: 'method',
    detail: 'void std::vector<T>::pop_back()',
    documentation: 'Элементи охирини векторро нест мекунад.',
    signature: 'void pop_back()',
    priority: 96
  },
  {
    label: 'clear()',
    insertText: 'clear()',
    kind: 'method',
    detail: 'void std::vector<T>::clear()',
    documentation: 'Ҳамаи элементҳои векторро тоза мекунад.',
    signature: 'void clear() noexcept',
    priority: 95
  },
  {
    label: 'empty()',
    insertText: 'empty()',
    kind: 'method',
    detail: 'bool std::vector<T>::empty() const',
    documentation: 'Месанҷад, ки оё вектор холӣ аст.',
    signature: 'bool empty() const noexcept',
    priority: 95
  },
  {
    label: 'begin()',
    insertText: 'begin()',
    kind: 'method',
    detail: 'iterator std::vector<T>::begin()',
    documentation: 'Итератор ба элементи аввалини векторро бармегардонад.',
    signature: 'iterator begin() noexcept',
    priority: 94
  },
  {
    label: 'end()',
    insertText: 'end()',
    kind: 'method',
    detail: 'iterator std::vector<T>::end()',
    documentation: 'Итератор ба мавқеи пас аз элементи охиринро бармегардонад.',
    signature: 'iterator end() noexcept',
    priority: 94
  },
  {
    label: 'front()',
    insertText: 'front()',
    kind: 'method',
    detail: 'reference std::vector<T>::front()',
    documentation: 'Элементи якуми векторро бармегардонад.',
    signature: 'T& front()',
    priority: 92
  },
  {
    label: 'back()',
    insertText: 'back()',
    kind: 'method',
    detail: 'reference std::vector<T>::back()',
    documentation: 'Элементи охирини векторро бармегардонад.',
    signature: 'T& back()',
    priority: 92
  },
  {
    label: 'at()',
    insertText: 'at(0)',
    kind: 'method',
    detail: 'reference std::vector<T>::at(size_t pos)',
    documentation: 'Дастрасӣ ба элемент бо санҷиши ҳудуди индекс.',
    signature: 'T& at(size_t pos)',
    priority: 91
  },
  {
    label: 'insert()',
    insertText: 'insert(begin(), val)',
    kind: 'method',
    detail: 'iterator std::vector<T>::insert(const_iterator pos, const T& value)',
    documentation: 'Ворид кардани элемент ба мавқеи муайян.',
    signature: 'iterator insert(const_iterator pos, const T& value)',
    priority: 88
  },
  {
    label: 'erase()',
    insertText: 'erase(begin())',
    kind: 'method',
    detail: 'iterator std::vector<T>::erase(const_iterator pos)',
    documentation: 'Нест кардани элемент дар мавқеи итератор.',
    signature: 'iterator erase(const_iterator pos)',
    priority: 88
  }
];

export const MAP_SET_METHODS: AutocompleteItem[] = [
  {
    label: 'insert()',
    insertText: 'insert({key, val})',
    kind: 'method',
    detail: 'pair<iterator, bool> insert(const value_type& value)',
    documentation: 'Ворид кардани элемент ба контейнер.',
    priority: 96
  },
  {
    label: 'find()',
    insertText: 'find(key)',
    kind: 'method',
    detail: 'iterator find(const Key& key)',
    documentation: 'Ҷустуҷӯи элемент аз рӯи калид.',
    priority: 96
  },
  {
    label: 'count()',
    insertText: 'count(key)',
    kind: 'method',
    detail: 'size_t count(const Key& key) const',
    documentation: 'Шумораи элементҳо бо калиди додашударо бармегардонад (0 ё 1).',
    priority: 95
  },
  {
    label: 'erase()',
    insertText: 'erase(key)',
    kind: 'method',
    detail: 'size_t erase(const Key& key)',
    documentation: 'Нест кардани элемент аз рӯи калид.',
    priority: 93
  },
  {
    label: 'size()',
    insertText: 'size()',
    kind: 'method',
    detail: 'size_t size() const',
    documentation: 'Шумораи элементҳоро бармегардонад.',
    priority: 95
  },
  {
    label: 'empty()',
    insertText: 'empty()',
    kind: 'method',
    detail: 'bool empty() const',
    documentation: 'Месанҷад, ки оё контейнер холӣ аст.',
    priority: 94
  },
  {
    label: 'clear()',
    insertText: 'clear()',
    kind: 'method',
    detail: 'void clear()',
    documentation: 'Тоза кардани ҳамаи элементҳо.',
    priority: 92
  }
];

export const CPP_SNIPPETS: AutocompleteItem[] = [
  {
    label: 'main',
    insertText: 'int main() {\n    \n    return 0;\n}',
    kind: 'snippet',
    detail: 'Шаблони функсияи асосии int main()',
    documentation: 'Функсияи асосии барномаи C++ бо бозгашти return 0;',
    cursorOffset: -15,
    priority: 85
  },
  {
    label: 'for',
    insertText: 'for (int i = 0; i < n; i++) {\n    \n}',
    kind: 'snippet',
    detail: 'Даври стандартии for',
    documentation: 'Сохтани даври такроршаванда бо тағйирёбандаи индекси i.',
    cursorOffset: -2,
    priority: 84
  },
  {
    label: 'fori',
    insertText: 'for (size_t i = 0; i < v.size(); ++i) {\n    \n}',
    kind: 'snippet',
    detail: 'Даври for барои контейнерҳо',
    documentation: 'Давр аз рӯи андозаи вектор ё массив.',
    cursorOffset: -2,
    priority: 83
  },
  {
    label: 'while',
    insertText: 'while (condition) {\n    \n}',
    kind: 'snippet',
    detail: 'Даври шартии while',
    documentation: 'Иҷрои блок то даме ки шарт дуруст аст.',
    cursorOffset: -2,
    priority: 83
  },
  {
    label: 'if',
    insertText: 'if (condition) {\n    \n}',
    kind: 'snippet',
    detail: 'Оператори шартии if',
    documentation: 'Санҷиши шарт ва иҷрои блок дар ҳолати дуруст будан.',
    cursorOffset: -2,
    priority: 84
  },
  {
    label: 'ifelse',
    insertText: 'if (condition) {\n    \n} else {\n    \n}',
    kind: 'snippet',
    detail: 'Сохтори пурраи if / else',
    documentation: 'Санҷиши шарт бо шохаи алтернативии else.',
    cursorOffset: -14,
    priority: 83
  },
  {
    label: 'switch',
    insertText: 'switch (value) {\n    case 1:\n        break;\n    default:\n        break;\n}',
    kind: 'snippet',
    detail: 'Оператори интихобии switch / case',
    documentation: 'Интихоби якчанд ҳолат аз рӯи қимати тағйирёбанда.',
    priority: 80
  },
  {
    label: 'class',
    insertText: 'class MyClass {\npublic:\n    MyClass() {}\n    ~MyClass() {}\n\nprivate:\n    \n};',
    kind: 'snippet',
    detail: 'Эълони синфи C++ (class)',
    documentation: 'Сохтани синфи нав бо конструктор, деструктор ва қисмҳои public/private.',
    priority: 82
  },
  {
    label: 'struct',
    insertText: 'struct Item {\n    int id;\n    std::string name;\n};',
    kind: 'snippet',
    detail: 'Эълони сохтори C++ (struct)',
    documentation: 'Сохтани сохтори маълумот бо майдонҳои кушода.',
    priority: 82
  },
  {
    label: 'function',
    insertText: 'int calculate(int a, int b) {\n    return a + b;\n}',
    kind: 'snippet',
    detail: 'Шаблони функсияи C++',
    documentation: 'Эҷоди функсия бо параметрҳо ва қимати бозгашт.',
    priority: 80
  },
  {
    label: 'trycatch',
    insertText: 'try {\n    \n} catch (const std::exception& e) {\n    std::cerr << e.what() << std::endl;\n}',
    kind: 'snippet',
    detail: 'Блоки коркарди истисноҳо try / catch',
    documentation: 'Доштани хатоҳои вақти иҷро бо std::exception.',
    priority: 79
  },
  {
    label: 'cout',
    insertText: 'std::cout << "" << std::endl;',
    kind: 'snippet',
    detail: 'Чопи сатр дар экран',
    documentation: 'Баровардани маълумот ба консол ва гузариш ба сатри нав.',
    cursorOffset: -15,
    priority: 86
  },
  {
    label: 'cin',
    insertText: 'std::cin >> variable;',
    kind: 'snippet',
    detail: 'Воридоти маълумот аз клавиатура',
    documentation: 'Хондани қимат ба тағйирёбанда аз std::cin.',
    priority: 85
  }
];
