export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  expanded?: boolean;
}

export type Language = 'javascript' | 'python' | 'cpp';

export interface LanguageConfig {
  name: string;
  code: string;
  extension: string;
  monacoLanguage: string;
  defaultContent: string;
}

export const LANGUAGE_CONFIGS: Record<Language, LanguageConfig> = {
  javascript: {
    name: 'JavaScript',
    code: 'JS',
    extension: '.js',
    monacoLanguage: 'javascript',
    defaultContent: `function main() {
  console.log("Hello World!");
}

main();`
  },
  python: {
    name: 'Python',
    code: 'PY',
    extension: '.py',
    monacoLanguage: 'python',
    defaultContent: `def main():
    print("Hello World!")

if __name__ == "__main__":
    main()`
  },
  cpp: {
    name: 'C++',
    code: 'CPP',
    extension: '.cpp',
    monacoLanguage: 'cpp',
    defaultContent: `#include <iostream>

int main() {
    std::cout << "Hello World!" << std::endl;
    return 0;
}`
  }
};

