#include <stdlib.h>
#include <filesystem>
#include <string>

int main(int argc, char** argv){
    std::string cmd = "ts-node -T -P \"$LORIGIN/tsconfig.json\" \"$LORIGIN/bin/build_origin.ts\" ";
    std::string cwd = std::filesystem::current_path().string();
    std::string full_cmd = cmd.append(cwd).c_str();
    system(full_cmd.c_str());
    return 0;
}