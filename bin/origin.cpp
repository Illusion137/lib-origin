#include <stdlib.h>
#include <filesystem>
#include <iostream>
#include <string>

int main(int argc, char** argv){
    const char* lorigin = std::getenv("LORIGIN");
    if (lorigin == nullptr) {
        std::cerr << "No $LORIGIN supplied." << std::endl;
        return 1;
    }
    std::string cwd = std::filesystem::current_path().string();
    std::string cmd = "ts-node -T -P \"" + std::string(lorigin) + "/tsconfig.json\" \"" +
        std::string(lorigin) + "/bin/build_origin.ts\" \"" + cwd + "\"";
    return system(cmd.c_str());
}
